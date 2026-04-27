import { requireAdmin } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";
import AdminOrdersClient from "./ordersClient";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  await requireAdmin();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const { data: orders } = await supabase
    .from("orders")
    .select(`
      id,
      status,
      total_amount,
      created_at,
      payment_method,
      shipping_provider,
      boxnow_locker_id,
      boxnow_parcel_id,
      boxnow_reference_number,
      boxnow_calculated_weight,
      boxnow_label_url,
      boxnow_last_event,
      boxnow_sync_status,
      boxnow_sync_error,
      shipping_address,
      order_items (
        id,
        quantity,
        price,
        product:products (
          id,
          name
        )
      )
    `)
    .order("created_at", { ascending: false });

  const normalizedOrders = (orders ?? []).map((order) => ({
    ...order,
    order_items: (order.order_items ?? []).map((item) => ({
      ...item,
      product: Array.isArray(item.product) ? (item.product[0] ?? null) : (item.product ?? null),
    })),
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-xl sm:text-2xl font-semibold">Narudžbe</h2>
      <AdminOrdersClient orders={normalizedOrders} />
    </div>
  );
}


