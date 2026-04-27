'use client';

interface FiltersProps {
  polarized: boolean | null;
  onPolarizedChange: (value: boolean | null) => void;
}

export default function Filters({
  polarized,
  onPolarizedChange,
}: FiltersProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md space-y-4">
      <h3 className="font-semibold text-lg mb-4">Filtri</h3>

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

