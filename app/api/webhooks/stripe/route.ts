import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { syncOrderToBoxNow } from '@/lib/boxnow-sync';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'Missing signature or webhook secret' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 }
    );
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const orderId = paymentIntent.metadata?.orderId;

    if (orderId) {
      const { error } = await supabaseAdmin
        .from('orders')
        .update({
          payment_intent_id: paymentIntent.id,
          status: 'paid',
        })
        .eq('id', orderId);

      if (error) {
        console.error('Webhook: failed to update order', error);
        return NextResponse.json(
          { error: 'DB update failed' },
          { status: 500 }
        );
      }

      try {
        await syncOrderToBoxNow(orderId);
      } catch (syncError) {
        console.error('Webhook: BoxNow sync failed', syncError);
      }
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
