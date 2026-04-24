import { requireAdmin } from "@/lib/auth";
import Link from "next/link";

export default async function AdminHomePage() {
  const admin = await requireAdmin();

  return (
    <div className="space-y-8">
      <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold">Dobrodošao, {admin.email}</h2>
      <p className="text-slate-600">
        Ovo je administratorska nadzorna ploča. S lijeve strane odaberi
        &quot;Artikli&quot; za upravljanje proizvodima ili &quot;Narudžbe&quot;
        za pregled i označavanje narudžbi. Opcija &quot;Grupni popust&quot;
        omogućava brzo postavljanje popusta na više artikala odjednom.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/admin/products"
          className="bg-white p-6 rounded-xl shadow-soft hover:shadow-elegant transition-all duration-300 border border-gray-100"
        >
          <h2 className="text-lg sm:text-xl font-semibold mb-2">Upravljanje proizvodima</h2>
          <p className="text-gray-600">Dodaj, uredi ili obriši proizvode</p>
        </Link>

        <Link
          href="/admin/orders"
          className="bg-white p-6 rounded-xl shadow-soft hover:shadow-elegant transition-all duration-300 border border-gray-100"
        >
          <h2 className="text-lg sm:text-xl font-semibold mb-2">Narudžbe</h2>
          <p className="text-gray-600">Pregledaj sve narudžbe</p>
        </Link>

        <Link
          href="/admin/discounts"
          className="bg-white p-6 rounded-xl shadow-soft hover:shadow-elegant transition-all duration-300 border border-gray-100"
        >
          <h2 className="text-lg sm:text-xl font-semibold mb-2">Grupni popust</h2>
          <p className="text-gray-600">Postavi isti popust na više artikala</p>
        </Link>
      </div>
    </div>
  );
}

