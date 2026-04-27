import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import type { OrderInsert, OrderItemInsert } from '@/types/order';
import { calculateOrderTotal } from '@/lib/pricing';
import { sendOrderCreatedEmails } from '@/lib/email';

const orderSchema = z.object({
  total_amount: z.number().positive(),
  payment_method: z.enum(['card', 'cash_on_delivery']).default('card'),
  shipping_provider: z.enum(['internal', 'boxnow']).default('internal'),
  shipping_method: z.enum(['standard', 'boxnow_locker']).default('standard'),
  shipping_address: z.object({
    full_name: z.string(),
    email: z.string().email(),
    phone: z.string(),
    address_line1: z.string(),
    address_line2: z.string().optional(),
    city: z.string(),
    postal_code: z.string(),
    country: z.string(),
  }),
  items: z.array(
    z.object({
      product_id: z.string().uuid(),
      quantity: z.number().int().positive(),
      price: z.number().positive(),
    })
  ),
  payment_intent_id: z.string().optional(),
  boxnow_locker_id: z.string().optional(),
  boxnow_locker_name: z.string().optional(),
  boxnow_locker_address: z.string().optional(),
  boxnow_payment_mode: z.enum(['prepaid', 'cod']).optional(),
  boxnow_amount_to_be_collected: z.number().min(0).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await request.json();
    const validatedData = orderSchema.parse(body);
    const subtotal = validatedData.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const totalAmount = calculateOrderTotal(subtotal);

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          user_id: user?.id ?? null,
          total_amount: totalAmount,
          payment_method: validatedData.payment_method,
          shipping_provider: validatedData.shipping_provider,
          shipping_method: validatedData.shipping_method,
          shipping_address: validatedData.shipping_address,
          payment_intent_id: validatedData.payment_intent_id,
          boxnow_locker_id: validatedData.boxnow_locker_id ?? null,
          boxnow_locker_name: validatedData.boxnow_locker_name ?? null,
          boxnow_locker_address: validatedData.boxnow_locker_address ?? null,
          boxnow_payment_mode: validatedData.boxnow_payment_mode ?? null,
          boxnow_amount_to_be_collected: validatedData.boxnow_amount_to_be_collected ?? 0,
          boxnow_sync_status:
            validatedData.shipping_provider === 'boxnow' ? 'pending' : 'not_required',
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    // Create order items
    const orderItems: OrderItemInsert[] = validatedData.items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      // Rollback order creation
      await supabase.from('orders').delete().eq('id', order.id);
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    // Fetch complete order with items
    const { data: completeOrder, error: fetchError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          product:products (
            id,
            name,
            images
          )
        )
      `)
      .eq('id', order.id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    try {
      await sendOrderCreatedEmails({
        id: completeOrder.id,
        total_amount: Number(completeOrder.total_amount),
        payment_method: completeOrder.payment_method,
        shipping_provider: completeOrder.shipping_provider,
        shipping_address: completeOrder.shipping_address,
        order_items: completeOrder.order_items,
      });
    } catch (emailError) {
      console.error(`Order ${completeOrder.id}: failed to send order emails`, emailError);
    }

    return NextResponse.json(completeOrder, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

