"use client";

type Order = {
  id: string;
  status: "pending" | "shipped" | string;
  total_amount: number;
  created_at: string;
};

export default function AdminOrdersClient({ orders }: { orders: Order[] }) {
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
              <td className="px-4 py-2">{o.id.slice(0, 8)}…</td>
              <td className="px-4 py-2">
                {new Date(o.created_at).toLocaleString()}
              </td>
              <td className="px-4 py-2 text-right">
                {o.total_amount.toFixed(2)}&nbsp;€
              </td>
              <td className="px-4 py-2">
                {o.status === "pending" ? "Na čekanju" : "Poslano"}
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
    </div>
  );
}


