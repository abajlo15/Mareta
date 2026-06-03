"use client";

import { SHIRT_SIZES, sortShirtSizes, type ShirtSize } from "@/lib/shirtSizes";

export type SizeStockRow = { size: ShirtSize; stock: string };

type AdminShirtSizesFieldsProps = {
  isShirt: boolean;
  onIsShirtChange: (value: boolean) => void;
  sizeStocks: SizeStockRow[];
  onSizeStocksChange: (rows: SizeStockRow[]) => void;
  sizeToAdd: ShirtSize;
  onSizeToAddChange: (size: ShirtSize) => void;
};

export function createEmptySizeStocks(): SizeStockRow[] {
  return [];
}

export function sizeStocksFromOptions(
  options: { size: ShirtSize; stock: number }[] | undefined
): SizeStockRow[] {
  if (!options?.length) return [];
  return sortShirtSizes(options.map((o) => o.size)).map((size) => {
    const found = options.find((o) => o.size === size)!;
    return { size, stock: String(found.stock) };
  });
}

export default function AdminShirtSizesFields({
  isShirt,
  onIsShirtChange,
  sizeStocks,
  onSizeStocksChange,
  sizeToAdd,
  onSizeToAddChange,
}: AdminShirtSizesFieldsProps) {
  const usedSizes = new Set(sizeStocks.map((row) => row.size));
  const availableToAdd = SHIRT_SIZES.filter((size) => !usedSizes.has(size));

  const addSize = () => {
    if (!availableToAdd.includes(sizeToAdd)) return;
    onSizeStocksChange(
      sortShirtSizes([...sizeStocks.map((r) => r.size), sizeToAdd]).map((size) => {
        const existing = sizeStocks.find((r) => r.size === size);
        if (existing) return existing;
        return { size, stock: "0" };
      })
    );
  };

  const removeSize = (size: ShirtSize) => {
    onSizeStocksChange(sizeStocks.filter((row) => row.size !== size));
  };

  const updateStock = (size: ShirtSize, stock: string) => {
    onSizeStocksChange(
      sizeStocks.map((row) => (row.size === size ? { ...row, stock } : row))
    );
  };

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          checked={isShirt}
          onChange={(e) => {
            onIsShirtChange(e.target.checked);
            if (!e.target.checked) {
              onSizeStocksChange([]);
            }
          }}
        />
        <span>Majca</span>
      </label>

      {isShirt && (
        <div className="space-y-3 pl-1 border-l-2 border-slate-200 ml-1">
          <div className="flex flex-wrap items-end gap-2">
            <div className="flex-1 min-w-[120px]">
              <label className="block text-sm font-medium mb-1">Veličina</label>
              <select
                value={sizeToAdd}
                onChange={(e) => onSizeToAddChange(e.target.value as ShirtSize)}
                disabled={availableToAdd.length === 0}
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm disabled:bg-slate-100"
              >
                {availableToAdd.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={addSize}
              disabled={availableToAdd.length === 0}
              className="px-3 py-2 rounded border border-slate-300 text-sm hover:bg-slate-50 disabled:opacity-50"
            >
              Dodaj veličinu
            </button>
          </div>

          {sizeStocks.length === 0 ? (
            <p className="text-sm text-slate-500">Dodaj barem jednu veličinu.</p>
          ) : (
            <div className="space-y-2">
              {sizeStocks.map((row) => (
                <div
                  key={row.size}
                  className="flex flex-wrap items-center gap-2 border border-slate-200 rounded px-3 py-2"
                >
                  <span className="text-sm font-semibold w-8">{row.size}</span>
                  <div className="flex-1 min-w-[100px]">
                    <label className="sr-only">Zaliha {row.size}</label>
                    <input
                      type="number"
                      min="0"
                      className="w-full border border-slate-300 rounded px-2 py-1 text-sm"
                      placeholder="Zaliha"
                      value={row.stock}
                      onChange={(e) => updateStock(row.size, e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSize(row.size)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Ukloni
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
