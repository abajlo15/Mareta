export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'card' | 'cash_on_delivery';
export type ShippingProvider = 'internal' | 'boxnow';
export type ShippingMethod = 'standard' | 'boxnow_locker';
export type BoxNowPaymentMode = 'prepaid' | 'cod';
export type BoxNowSyncStatus = 'not_required' | 'pending' | 'synced' | 'failed';

export interface Order {
  id: string;
  user_id: string | null;
  total_amount: number;
  status: OrderStatus;
  shipping_address: ShippingAddress | null;
  payment_intent_id: string | null;
  payment_method: PaymentMethod;
  shipping_provider: ShippingProvider;
  shipping_method: ShippingMethod;
  boxnow_locker_id: string | null;
  boxnow_locker_name: string | null;
  boxnow_locker_address: string | null;
  boxnow_parcel_id: string | null;
  boxnow_reference_number: string | null;
  boxnow_payment_mode: BoxNowPaymentMode | null;
  boxnow_amount_to_be_collected: number | null;
  boxnow_calculated_weight: number | null;
  boxnow_label_url: string | null;
  boxnow_label_fetched_at: string | null;
  boxnow_last_event: string | null;
  boxnow_last_event_id: string | null;
  boxnow_last_event_time: string | null;
  boxnow_sync_status: BoxNowSyncStatus;
  boxnow_sync_error: string | null;
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
  user_id: string | null;
  total_amount: number;
  status?: OrderStatus;
  shipping_address?: ShippingAddress | null;
  payment_intent_id?: string | null;
  payment_method?: PaymentMethod;
  shipping_provider?: ShippingProvider;
  shipping_method?: ShippingMethod;
  boxnow_locker_id?: string | null;
  boxnow_locker_name?: string | null;
  boxnow_locker_address?: string | null;
  boxnow_payment_mode?: BoxNowPaymentMode | null;
  boxnow_amount_to_be_collected?: number | null;
  boxnow_calculated_weight?: number | null;
  boxnow_sync_status?: BoxNowSyncStatus;
}

export interface OrderItemInsert {
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
}

