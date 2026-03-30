import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, paymentIntentId } = body;

    if (!orderId || !paymentIntentId) {
      return NextResponse.json(
        { error: 'Missing orderId or paymentIntentId' },
        { status: 400 }
      );
    }

    // Update order with payment intent ID and status
    const { error } = await supabase
      .from('orders')
      .update({
        payment_intent_id: paymentIntentId,
        status: 'paid',
      })
      .eq('id', orderId)
      .eq('user_id', user.id); // Ensure user owns the order

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

