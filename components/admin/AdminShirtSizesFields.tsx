"use client";

import { useEffect, useMemo } from "react";
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

function isSizeInUse(size: ShirtSize, rows: SizeStockRow[]): boolean {
  return rows.some((row) => row.size === size);
}

function sortSizeStockRows(rows: SizeStockRow[]): SizeStockRow[] {
  const order = sortShirtSizes(rows.map((row) => row.size));
  return order.map((size) => rows.find((row) => row.size === size)!);
}

function getAvailableSizes(rows: SizeStockRow[]): ShirtSize[] {
  return SHIRT_SIZES.filter((size) => !isSizeInUse(size, rows));
}

export function sizeStocksFromOptions(
  options: { size: ShirtSize; stock: number }[] | undefined
): SizeStockRow[] {
  if (!options?.length) return [];
  const rows = options.map((o) => ({ size: o.size, stock: String(o.stock) }));
  return sortSizeStockRows(rows);
}

export default function AdminShirtSizesFields({
  isShirt,
  onIsShirtChange,
  sizeStocks,
  onSizeStocksChange,
  sizeToAdd,
  onSizeToAddChange,
}: AdminShirtSizesFieldsProps) {
  const availableToAdd = useMemo(
    () => getAvailableSizes(sizeStocks),
    [sizeStocks]
  );

  useEffect(() => {
    if (!isShirt || availableToAdd.length === 0) return;
    if (!availableToAdd.includes(sizeToAdd)) {
      onSizeToAddChange(availableToAdd[0]);
    }
  }, [isShirt, availableToAdd, sizeToAdd, onSizeToAddChange]);

  const addSize = () => {
    if (isSizeInUse(sizeToAdd, sizeStocks)) return;
    if (!availableToAdd.includes(sizeToAdd)) return;

    const nextRows = sortSizeStockRows([
      ...sizeStocks,
      { size: sizeToAdd, stock: "0" },
    ]);
    onSizeStocksChange(nextRows);

    const stillAvailable = getAvailableSizes(nextRows);
    if (stillAvailable.length > 0) {
      onSizeToAddChange(stillAvailable[0]);
    }
  };

  const removeSize = (size: ShirtSize) => {
    const nextRows = sizeStocks.filter((row) => row.size === size ? false : true);
    onSizeStocksChange(nextRows);

    const stillAvailable = getAvailableSizes(nextRows);
    if (stillAvailable.length > 0) {
      onSizeToAddChange(stillAvailable[0]);
    }
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
            } else {
              const first = getAvailableSizes([]);
              if (first.length > 0) {
                onSizeToAddChange(first[0]);
              }
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
              {sortSizeStockRows(sizeStocks).map((row) => (
                <div
                  key={row.size}
                  className="flex flex-wrap items-center gap-2 border border-slate-200 rounded px-3 py-2"
                >
                  <span className="text-sm font-semibold min-w-[2rem]">{row.size}</span>
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
