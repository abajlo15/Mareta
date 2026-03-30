import Link from "next/link";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category?: string | null;
  stock?: number;
  images?: string[] | null;
};

export default function AdminProductsList({ products }: { products: Product[] }) {
  if (!products.length) {
    return <p className="text-slate-500">Još nema artikala.</p>;
  }

  return (
    <div className="border border-slate-200 rounded-lg bg-white shadow-sm overflow-x-auto">
      <table className="w-full text-sm min-w-[640px]">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-2 text-left">Slika</th>
            <th className="px-4 py-2 text-left">Naziv</th>
            <th className="px-4 py-2 text-left">Kategorija</th>
            <th className="px-4 py-2 text-left">Opis</th>
            <th className="px-4 py-2 text-right">Zaliha</th>
            <th className="px-4 py-2 text-right">Cijena</th>
            <th className="px-4 py-2 text-left">Akcije</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-t border-slate-100">
              <td className="px-4 py-2">
                {p.images?.[0] ? (
                  <img
                    src={p.images[0]}
                    alt=""
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </td>
              <td className="px-4 py-2">{p.name}</td>
              <td className="px-4 py-2 text-slate-600">
                {p.category || "-"}
              </td>
              <td className="px-4 py-2 text-slate-600">
                {p.description || "-"}
              </td>
              <td className="px-4 py-2 text-right">
                {p.stock ?? 0}
              </td>
              <td className="px-4 py-2 text-right">
                {p.price.toFixed(2)}&nbsp;€
              </td>
              <td className="px-4 py-2">
                <Link
                  href={`/admin/products/${p.id}`}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Uredi
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


