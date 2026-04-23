export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'card' | 'cash_on_delivery';

export interface Order {
  id: string;
  user_id: string | null;
  total_amount: number;
  status: OrderStatus;
  shipping_address: ShippingAddress | null;
  payment_intent_id: string | null;
  payment_method: PaymentMethod;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at: string;
}

export interface OrderWithItems extends Order {
  order_items: (OrderItem & {
    product: {
      id: string;
      name: string;
      images: string[];
    };
  })[];
}

export interface ShippingAddress {
  full_name: string;
  email: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  postal_code: string;
  country: string;
}

export interface OrderInsert {
  user_id: string;
  total_amount: number;
  status?: OrderStatus;
  shipping_address?: ShippingAddress | null;
  payment_intent_id?: string | null;
  payment_method?: PaymentMethod;
}

export interface OrderItemInsert {
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
}

