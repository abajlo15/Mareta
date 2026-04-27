import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyBoxNowSignature } from '@/lib/boxnow';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

type BoxNowWebhookPayload = {
  id?: string;
  datasignature?: string;
  data?: {
    parcelId?: string;
    orderNumber?: string;
    event?: string;
    time?: string;
  };
};

function mapBoxNowEventToOrderStatus(event: string): 'pending' | 'shipped' | 'delivered' | 'cancelled' {
  if (event === 'delivered') return 'delivered';
  if (event === 'returned' || event === 'expired' || event === 'canceled') return 'cancelled';
  if (
    event === 'in-depot' ||
    event === 'final-destination' ||
    event === 'accepted-to-locker' ||
    event === 'accepted-for-return'
  ) {
    return 'shipped';
  }
  return 'pending';
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  let payload: BoxNowWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as BoxNowWebhookPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const signatureFromBody = payload.datasignature;
  const signatureFromHeader = request.headers.get('x-boxnow-signature') || undefined;
  const signature = signatureFromBody || signatureFromHeader;
  if (!signature || !verifyBoxNowSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const parcelId = payload.data?.parcelId;
  const orderNumber = payload.data?.orderNumber;
  const event = payload.data?.event || 'unknown';
  const eventTime = payload.data?.time || new Date().toISOString();
  if (!parcelId && !orderNumber) {
    return NextResponse.json({ error: 'Missing parcelId/orderNumber' }, { status: 400 });
  }

  let query = supabaseAdmin
    .from('orders')
    .select('id,boxnow_last_event_time,boxnow_last_event_id,boxnow_payment_mode');
  if (orderNumber) {
    query = query.eq('id', orderNumber);
  } else {
    query = query.eq('boxnow_parcel_id', parcelId!);
  }
  const { data: order, error: findError } = await query.single();
  if (findError || !order) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  if ((order as { boxnow_last_event_id?: string | null }).boxnow_last_event_id === payload.id) {
    return NextResponse.json({ ok: true, deduplicated: true }, { status: 200 });
  }

  const lastEventTime = order.boxnow_last_event_time ? new Date(order.boxnow_last_event_time) : null;
  const incomingTime = new Date(eventTime);
  if (lastEventTime && incomingTime <= lastEventTime) {
    return NextResponse.json({ ok: true, deduplicated: true }, { status: 200 });
  }

  const mappedStatus = mapBoxNowEventToOrderStatus(event);
  const nextStatus =
    event === 'delivered' && order.boxnow_payment_mode === 'cod'
      ? 'paid'
      : mappedStatus;

  const { error: updateError } = await supabaseAdmin
    .from('orders')
    .update({
      status: nextStatus,
      boxnow_last_event: event,
      boxnow_last_event_id: payload.id ?? null,
      boxnow_last_event_time: eventTime,
      boxnow_sync_status: 'synced',
      boxnow_sync_error: null,
    })
    .eq('id', order.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
