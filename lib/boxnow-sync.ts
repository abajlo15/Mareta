import { createClient } from '@supabase/supabase-js';
import { createBoxNowDeliveryRequest, fetchBoxNowLabel } from '@/lib/boxnow';

type OrderRow = {
  id: string;
  total_amount: number;
  payment_method: 'card' | 'cash_on_delivery';
  shipping_provider: 'internal' | 'boxnow';
  shipping_method: 'standard' | 'boxnow_locker';
  shipping_address: {
    full_name?: string;
    email?: string;
    phone?: string;
  } | null;
  boxnow_locker_id: string | null;
  boxnow_parcel_id: string | null;
  boxnow_sync_status: 'not_required' | 'pending' | 'synced' | 'failed';
  order_items?: Array<{
    id: string;
    product_id: string;
    quantity: number;
    price: number;
    product?: { name?: string } | null;
  }>;
};

// Typical sunglasses weight is commonly cited around 25-50g; we use a 35g average per pair.
const AVERAGE_SUNGLASSES_WEIGHT_KG = 0.035;
// Packaging (box, filler, label) adds baseline shipping weight per parcel.
const PACKAGE_BASE_WEIGHT_KG = 0.1;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function normalizePhone(phone?: string): string {
  const raw = (phone || '').trim();
  if (!raw) return '+385000000000';

  // Keep only digits and an optional leading plus.
  let cleaned = raw.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('00')) {
    cleaned = `+${cleaned.slice(2)}`;
  }
  if (cleaned.startsWith('+')) {
    const digits = cleaned.slice(1).replace(/\D/g, '');
    return `+${digits}`;
  }

  const digits = cleaned.replace(/\D/g, '');
  if (digits.startsWith('385')) {
    return `+${digits}`;
  }
  if (digits.startsWith('0')) {
    return `+385${digits.slice(1)}`;
  }
  return `+${digits}`;
}

function toBoxNowLocationId(value: string | null | undefined, fieldName: string): number {
  const raw = (value || '').trim();
  const numericCandidate = /^\d+$/.test(raw) ? raw : raw.match(/\d+/)?.[0] || '';
  const parsed = Number.parseInt(numericCandidate, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${fieldName} must be a positive integer.`);
  }
  return parsed;
}

function shouldRetry(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const text = error.message.toLowerCase();
  return text.includes('503') || text.includes('temporary') || text.includes('unavailable');
}

async function withRetry<T>(operation: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (!shouldRetry(error) || i === attempts - 1) {
        throw error;
      }
      const delayMs = [1000, 3000, 7000][i] || 7000;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw lastError;
}

export async function syncOrderToBoxNow(orderId: string): Promise<void> {
  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select(
      `
      id,total_amount,payment_method,shipping_provider,shipping_method,shipping_address,
      boxnow_locker_id,boxnow_parcel_id,boxnow_sync_status,
      order_items (id,product_id,quantity,price,product:products(name))
      `
    )
    .eq('id', orderId)
    .single<OrderRow>();

  if (error || !order) {
    throw new Error('Order not found for BoxNow sync.');
  }
  if (order.shipping_provider !== 'boxnow' || order.shipping_method !== 'boxnow_locker') {
    return;
  }
  if (order.boxnow_parcel_id && order.boxnow_sync_status === 'synced') {
    return;
  }

  const shipping = order.shipping_address || {};
  const lockerId = order.boxnow_locker_id;
  if (!lockerId) {
    throw new Error('Missing BoxNow locker ID on order.');
  }

  const warehouseId = toBoxNowLocationId(requireEnv('BOXNOW_WAREHOUSE_ID'), 'BOXNOW_WAREHOUSE_ID');
  const destinationLocationId = toBoxNowLocationId(lockerId, 'BoxNow locker ID');
  const partnerName = process.env.BOXNOW_ORIGIN_NAME || 'Mareta Shop';
  const partnerPhone = normalizePhone(process.env.BOXNOW_ORIGIN_PHONE || shipping.phone);
  const partnerEmail = process.env.BOXNOW_ORIGIN_EMAIL || shipping.email || 'noreply@example.com';

  const paymentMode: 'cod' | 'prepaid' =
    order.payment_method === 'cash_on_delivery' ? 'cod' : 'prepaid';
  const amountToBeCollected =
    paymentMode === 'cod' ? Number(order.total_amount).toFixed(2) : '0.00';

  const item = order.order_items?.[0];
  const totalQuantity = (order.order_items || []).reduce((sum, orderItem) => sum + orderItem.quantity, 0) || 1;
  const totalWeightKg = Number(
    (PACKAGE_BASE_WEIGHT_KG + AVERAGE_SUNGLASSES_WEIGHT_KG * totalQuantity).toFixed(3)
  );
  const createPayload = {
    orderNumber: order.id,
    invoiceValue: Number(order.total_amount).toFixed(2),
    paymentMode,
    amountToBeCollected,
    allowReturn: true,
    origin: {
      contactNumber: partnerPhone,
      contactEmail: partnerEmail,
      contactName: partnerName,
      locationId: String(warehouseId),
    },
    destination: {
      contactNumber: normalizePhone(shipping.phone),
      contactEmail: shipping.email || 'unknown@example.com',
      contactName: shipping.full_name || 'Customer',
      locationId: String(destinationLocationId),
    },
    items: [
      {
        id: item?.id || `${order.id}-1`,
        name: item?.product?.name || 'Order package',
        value: Number(order.total_amount).toFixed(2),
        weight: totalWeightKg,
        compartmentSize: 1,
      },
    ],
  };

  try {
    const delivery = await withRetry(() => createBoxNowDeliveryRequest(createPayload));
    const parcelId = delivery.parcels?.[0]?.id || null;
    let labelUrl: string | null = null;
    if (parcelId) {
      try {
        labelUrl = await fetchBoxNowLabel(parcelId);
      } catch {
        labelUrl = null;
      }
    }

    await supabaseAdmin
      .from('orders')
      .update({
        boxnow_parcel_id: parcelId,
        boxnow_reference_number: delivery.referenceNumber ?? null,
        boxnow_calculated_weight: totalWeightKg,
        boxnow_payment_mode: paymentMode,
        boxnow_amount_to_be_collected: Number(amountToBeCollected),
        boxnow_label_url: labelUrl,
        boxnow_label_fetched_at: labelUrl ? new Date().toISOString() : null,
        boxnow_sync_status: 'synced',
        boxnow_sync_error: null,
      })
      .eq('id', order.id);
  } catch (syncError) {
    await supabaseAdmin
      .from('orders')
      .update({
        boxnow_sync_status: 'failed',
        boxnow_sync_error:
          syncError instanceof Error ? syncError.message.slice(0, 600) : 'Unknown sync error',
      })
      .eq('id', order.id);
    throw syncError;
  }
}
