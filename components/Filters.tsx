'use client';

interface FiltersProps {
  category: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
  subcollectionId: string;
  onSubcollectionChange: (subcollectionId: string) => void;
  subcollections: { id: string; name: string }[];
  polarized: boolean | null;
  onPolarizedChange: (value: boolean | null) => void;
}

export default function Filters({
  category,
  onCategoryChange,
  categories,
  subcollectionId,
  onSubcollectionChange,
  subcollections,
  polarized,
  onPolarizedChange,
}: FiltersProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md space-y-4">
      <h3 className="font-semibold text-lg mb-4">Filtri</h3>
      
      <div>
        <label className="block text-sm font-medium mb-2">Kolekcija</label>
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">Sve kolekcije</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Podkolekcija</label>
        <select
          value={subcollectionId}
          onChange={(e) => onSubcollectionChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">Sve podkolekcije</option>
          {subcollections.map((subcollection) => (
            <option key={subcollection.id} value={subcollection.id}>
              {subcollection.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className="block text-sm font-medium mb-2">Polarizirano</p>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={polarized === true}
              onChange={() => onPolarizedChange(polarized === true ? null : true)}
            />
            <span>DA</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={polarized === false}
              onChange={() => onPolarizedChange(polarized === false ? null : false)}
            />
            <span>NE</span>
          </label>
        </div>
      </div>
    </div>
  );
}

