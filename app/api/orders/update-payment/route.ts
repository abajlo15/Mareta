import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await request.json();
    const { orderId, paymentIntentId } = body as {
      orderId?: string;
      paymentIntentId?: string;
      guest?: boolean;
    };

    if (!orderId || !paymentIntentId) {
      return NextResponse.json(
        { error: 'Missing orderId or paymentIntentId' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('orders')
      .update({
        payment_intent_id: paymentIntentId,
        status: 'paid',
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

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

