import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { syncOrderToBoxNow } from '@/lib/boxnow-sync';
import {
  cancelBoxNowParcel,
  createBoxNowCustomerReturn,
  fetchBoxNowLabel,
} from '@/lib/boxnow';
import { createClient } from '@supabase/supabase-js';

type Params = { params: Promise<{ id: string }> };

type ActionBody = {
  action?: 'sync_now' | 'refetch_label' | 'cancel_parcel' | 'create_return';
};

function toLocationId(value: string | null | undefined, fieldName: string): string {
  const raw = (value || '').trim();
  const numericCandidate = /^\d+$/.test(raw) ? raw : raw.match(/\d+/)?.[0] || '';
  const parsed = Number.parseInt(numericCandidate, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${fieldName} mora biti pozitivan broj.`);
  }
  return String(parsed);
}

export async function POST(request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Niste prijavljeni.' }, { status: 401 });
  }
  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Nemate ovlasti za ovu akciju.' }, { status: 403 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
  const { id } = await params;
  const body = (await request.json()) as ActionBody;

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id,shipping_provider,boxnow_parcel_id,boxnow_locker_id,shipping_address,total_amount')
    .eq('id', id)
    .single();

  if (orderError) {
    const isNotFound = orderError.code === 'PGRST116';
    return NextResponse.json(
      { error: isNotFound ? 'Narudžba nije pronađena.' : `Greška čitanja narudžbe: ${orderError.message}` },
      { status: isNotFound ? 404 : 500 }
    );
  }
  if (!order) {
    return NextResponse.json({ error: 'Narudžba nije pronađena.' }, { status: 404 });
  }
  if (order.shipping_provider !== 'boxnow') {
    return NextResponse.json({ error: 'Narudžba nije BoxNow tipa.' }, { status: 400 });
  }

  try {
    if (body.action === 'sync_now') {
      await syncOrderToBoxNow(id);
      return NextResponse.json({ ok: true });
    }

    if (body.action === 'refetch_label') {
      if (!order.boxnow_parcel_id) {
        return NextResponse.json({ error: 'Parcel ID nedostaje.' }, { status: 400 });
      }
      const labelUrl = await fetchBoxNowLabel(order.boxnow_parcel_id);
      await supabase
        .from('orders')
        .update({
          boxnow_label_url: labelUrl,
          boxnow_label_fetched_at: new Date().toISOString(),
        })
        .eq('id', id);
      return NextResponse.json({ ok: true, labelUrl });
    }

    if (body.action === 'cancel_parcel') {
      if (!order.boxnow_parcel_id) {
        return NextResponse.json({ error: 'Parcel ID nedostaje.' }, { status: 400 });
      }
      await cancelBoxNowParcel(order.boxnow_parcel_id);
      await supabase
        .from('orders')
        .update({ status: 'cancelled', boxnow_last_event: 'canceled' })
        .eq('id', id);
      return NextResponse.json({ ok: true });
    }

    if (body.action === 'create_return') {
      if (!order.boxnow_locker_id || !order.shipping_address) {
        return NextResponse.json({ error: 'Nedostaju podaci za povrat.' }, { status: 400 });
      }
      const shippingAddress = order.shipping_address as {
        full_name?: string;
        email?: string;
        phone?: string;
      };
      const response = await createBoxNowCustomerReturn({
        orderNumber: `return-${id}`,
        sender: {
          contactPhoneNumber: shippingAddress.phone || '',
          contactEmail: shippingAddress.email || '',
          contactName: shippingAddress.full_name || 'Customer',
          locationId: toLocationId(order.boxnow_locker_id, 'BoxNow locker ID'),
        },
        destination: {
          locationId: toLocationId(process.env.BOXNOW_WAREHOUSE_ID, 'BOXNOW_WAREHOUSE_ID'),
        },
        items: [
          {
            id: `${id}-return`,
            name: `Return ${id.slice(0, 8)}`,
            value: Number(order.total_amount).toFixed(2),
          },
        ],
      });
      return NextResponse.json({ ok: true, response });
    }

    return NextResponse.json({ error: 'Nepoznata akcija.' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'BoxNow akcija nije uspjela.' },
      { status: 500 }
    );
  }
}
