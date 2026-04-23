"use client";

import { useState } from "react";

type Order = {
  id: string;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled" | string;
  total_amount: number;
  created_at: string;
  payment_method?: "card" | "cash_on_delivery" | string;
  shipping_address?: {
    full_name?: string;
    email?: string;
    phone?: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    postal_code?: string;
    country?: string;
  } | null;
  order_items?: Array<{
    id: string;
    quantity: number;
    price: number;
    product?: { id: string; name: string } | null;
  }> | null;
};

export default function AdminOrdersClient({ orders }: { orders: Order[] }) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  function statusLabel(status: string) {
    if (status === "pending") return "Na čekanju";
    if (status === "paid") return "Plaćeno";
    if (status === "shipped") return "Poslano";
    if (status === "delivered") return "Dostavljeno";
    if (status === "cancelled") return "Otkazano";
    return status;
  }

  function paymentMethodLabel(paymentMethod?: string) {
    if (paymentMethod === "card") return "Kartica";
    if (paymentMethod === "cash_on_delivery") return "Pouzećem";
    return "—";
  }

  async function copyShippingDetails(order: Order) {
    if (!order.shipping_address) return;

    const lines = [
      `Narudžba: #${order.id.slice(0, 8)}`,
      `Ime i prezime: ${order.shipping_address.full_name || "—"}`,
      `Telefon: ${order.shipping_address.phone || "—"}`,
      `Email: ${order.shipping_address.email || "—"}`,
      `Adresa: ${order.shipping_address.address_line1 || "—"}${
        order.shipping_address.address_line2 ? `, ${order.shipping_address.address_line2}` : ""
      }`,
      `Grad / poštanski broj: ${order.shipping_address.postal_code || "—"} ${
        order.shipping_address.city || ""
      }`.trim(),
      `Država: ${order.shipping_address.country || "—"}`,
      `Iznos: ${order.total_amount.toFixed(2)} €`,
      `Način plaćanja: ${paymentMethodLabel(order.payment_method)}`,
    ];

    await navigator.clipboard.writeText(lines.join("\n"));
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  }

  async function markShipped(id: string) {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "shipped" }),
    });

    if (!res.ok) {
      alert("Greška pri označavanju narudžbe.");
      return;
    }

    window.location.reload();
  }

  if (!orders.length) {
    return <p className="text-slate-500">Još nema narudžbi.</p>;
  }

  return (
    <div className="border border-slate-200 rounded-lg bg-white shadow-sm overflow-x-auto">
      <table className="w-full text-sm min-w-[500px]">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-2 text-left">ID</th>
            <th className="px-4 py-2 text-left">Datum</th>
            <th className="px-4 py-2 text-right">Iznos</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-right">Akcija</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-t border-slate-100">
              <td className="px-4 py-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(o)}
                  className="text-blue-600 hover:text-blue-800 underline underline-offset-2"
                >
                  {o.id.slice(0, 8)}…
                </button>
              </td>
              <td className="px-4 py-2">
                {new Date(o.created_at).toLocaleString()}
              </td>
              <td className="px-4 py-2 text-right">
                {o.total_amount.toFixed(2)}&nbsp;€
              </td>
              <td className="px-4 py-2">
                {statusLabel(o.status)}
              </td>
              <td className="px-4 py-2 text-right">
                {o.status === "pending" && (
                  <button
                    onClick={() => markShipped(o.id)}
                    className="px-3 py-1 rounded bg-emerald-600 text-white text-xs hover:bg-emerald-700"
                  >
                    Označi kao poslano
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSelectedOrder(null)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Detalji narudžbe #{selectedOrder.id.slice(0, 8)}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="text-slate-500 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Status</p>
                <p className="font-medium">{statusLabel(selectedOrder.status)}</p>
              </div>
              <div>
                <p className="text-slate-500">Način plaćanja</p>
                <p className="font-medium">{paymentMethodLabel(selectedOrder.payment_method)}</p>
              </div>
              <div>
                <p className="text-slate-500">Datum</p>
                <p className="font-medium">
                  {new Date(selectedOrder.created_at).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Ukupno</p>
                <p className="font-medium">{selectedOrder.total_amount.toFixed(2)} €</p>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Podaci za dostavu</h4>
                {selectedOrder.shipping_address && (
                  <button
                    type="button"
                    onClick={() => copyShippingDetails(selectedOrder)}
                    className="text-xs px-2 py-1 rounded border border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    Kopiraj podatke za dostavu
                  </button>
                )}
              </div>
              {copySuccess && (
                <p className="text-xs text-emerald-600 mb-2">Podaci su kopirani.</p>
              )}
              {selectedOrder.shipping_address ? (
                <div className="text-sm space-y-1 text-slate-700">
                  <p>
                    <span className="text-slate-500">Ime i prezime:</span>{" "}
                    {selectedOrder.shipping_address.full_name || "—"}
                  </p>
                  <p>
                    <span className="text-slate-500">Email:</span>{" "}
                    {selectedOrder.shipping_address.email || "—"}
                  </p>
                  <p>
                    <span className="text-slate-500">Telefon:</span>{" "}
                    {selectedOrder.shipping_address.phone || "—"}
                  </p>
                  <p>
                    <span className="text-slate-500">Adresa:</span>{" "}
                    {selectedOrder.shipping_address.address_line1 || "—"}
                    {selectedOrder.shipping_address.address_line2
                      ? `, ${selectedOrder.shipping_address.address_line2}`
                      : ""}
                  </p>
                  <p>
                    <span className="text-slate-500">Grad / poštanski broj:</span>{" "}
                    {selectedOrder.shipping_address.postal_code || "—"}{" "}
                    {selectedOrder.shipping_address.city || ""}
                  </p>
                  <p>
                    <span className="text-slate-500">Država:</span>{" "}
                    {selectedOrder.shipping_address.country || "—"}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-slate-500">Nema podataka o dostavi.</p>
              )}
            </div>

            <div className="mt-6">
              <h4 className="font-semibold mb-2">Stavke narudžbe</h4>
              {selectedOrder.order_items?.length ? (
                <div className="space-y-2">
                  {selectedOrder.order_items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-sm border rounded px-3 py-2"
                    >
                      <p className="font-medium">{item.product?.name || "Proizvod"}</p>
                      <p className="text-slate-600">
                        {item.quantity} x {item.price.toFixed(2)} €
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">Nema stavki narudžbe.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


