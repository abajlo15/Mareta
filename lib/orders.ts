import type { Order, OrderWithItems } from '@/types/order';

export async function fetchOrders(): Promise<Order[]> {
  const response = await fetch('/api/orders');
  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }
  return response.json();
}

export async function fetchOrder(id: string): Promise<OrderWithItems> {
  const response = await fetch(`/api/orders/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch order');
  }
  return response.json();
}

export async function createOrder(orderData: {
  total_amount: number;
  shipping_address: {
    full_name: string;
    email: string;
    phone: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    postal_code: string;
    country: string;
  };
  items: Array<{
    product_id: string;
    quantity: number;
    price: number;
  }>;
  payment_method: 'card' | 'cash_on_delivery';
  payment_intent_id?: string;
}): Promise<OrderWithItems> {
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create order');
  }

  return response.json();
}

