import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import AdminOrdersClient from "./ordersClient";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const { data: orders } = await supabase
    .from("orders")
    .select(`
      id,
      status,
      total_amount,
      created_at,
      payment_method,
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

  return (
    <div className="space-y-6">
      <h2 className="text-xl sm:text-2xl font-semibold">Narudžbe</h2>
      <AdminOrdersClient orders={orders ?? []} />
    </div>
  );
}


