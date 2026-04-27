import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { syncOrderToBoxNow } from '@/lib/boxnow-sync';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await request.json();
    const { orderId, paymentIntentId, codConfirmed } = body as {
      orderId?: string;
      paymentIntentId?: string;
      codConfirmed?: boolean;
      guest?: boolean;
    };

    if (!orderId || (!paymentIntentId && !codConfirmed)) {
      return NextResponse.json(
        { error: 'Missing orderId and payment confirmation payload' },
        { status: 400 }
      );
    }

    const { data: existingOrder, error: findOrderError } = await supabase
      .from('orders')
      .select('id,user_id,shipping_provider,boxnow_payment_mode')
      .eq('id', orderId)
      .single();

    if (findOrderError || !existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (user) {
      if (existingOrder.user_id !== user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    } else if (existingOrder.user_id !== null) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const shouldKeepPendingForBoxNowCod =
      codConfirmed === true &&
      existingOrder.shipping_provider === 'boxnow' &&
      existingOrder.boxnow_payment_mode === 'cod';

    const nextStatus = shouldKeepPendingForBoxNowCod ? 'pending' : 'paid';

    let query = supabase
      .from('orders')
      .update({
        payment_intent_id: paymentIntentId ?? 'cod-confirmed',
        status: nextStatus,
      })
      .eq('id', orderId);

    if (user) {
      query = query.eq('user_id', user.id); // user owns order
    } else {
      query = query.is('user_id', null); // guest order
    }

    const { error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Best effort sync for BoxNow deliveries once payment is confirmed.
    try {
      await syncOrderToBoxNow(orderId);
    } catch (syncError) {
      console.error('BoxNow sync failed after payment update:', syncError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

