import type { Product } from '@/types/product';

export const SHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL'] as const;
export type ShirtSize = (typeof SHIRT_SIZES)[number];

export type SizeStockInput = { size: string; stock: number };

const SHIRT_SIZE_ORDER = new Map(SHIRT_SIZES.map((s, i) => [s, i]));

export function isShirtSize(value: string): value is ShirtSize {
  return (SHIRT_SIZES as readonly string[]).includes(value);
}

export function sortShirtSizes(sizes: ShirtSize[]): ShirtSize[] {
  return [...sizes].sort((a, b) => (SHIRT_SIZE_ORDER.get(a) ?? 0) - (SHIRT_SIZE_ORDER.get(b) ?? 0));
}

export function normalizeSizeStocks(
  input: unknown
): { ok: true; sizeStocks: { size: ShirtSize; stock: number }[] } | { ok: false; error: string } {
  if (!Array.isArray(input) || input.length === 0) {
    return { ok: false, error: 'Odaberi barem jednu veličinu majice.' };
  }

  const seen = new Set<string>();
  const sizeStocks: { size: ShirtSize; stock: number }[] = [];

  for (const row of input) {
    if (!row || typeof row !== 'object') {
      return { ok: false, error: 'Neispravan format veličina.' };
    }
    const size = (row as SizeStockInput).size;
    const stock = (row as SizeStockInput).stock;
    if (typeof size !== 'string' || !isShirtSize(size)) {
      return { ok: false, error: 'Neispravna veličina majice.' };
    }
    if (seen.has(size)) {
      return { ok: false, error: `Veličina ${size} je duplicirana.` };
    }
    seen.add(size);
    const stockValue = typeof stock === 'number' && Number.isFinite(stock) ? Math.max(0, Math.floor(stock)) : 0;
    sizeStocks.push({ size, stock: stockValue });
  }

  const orderedSizes = sortShirtSizes(sizeStocks.map((s) => s.size));
  return {
    ok: true,
    sizeStocks: orderedSizes.map((size) => sizeStocks.find((s) => s.size === size)!),
  };
}

export function sumSizeStocks(sizeStocks: { stock: number }[]): number {
  return sizeStocks.reduce((sum, row) => sum + row.stock, 0);
}

export function mapProductSizesFromRows(
  rows: { size: string; stock: number }[] | null | undefined
): { size: ShirtSize; stock: number }[] {
  if (!rows?.length) return [];
  const mapped = rows
    .filter((row) => isShirtSize(row.size))
    .map((row) => ({ size: row.size as ShirtSize, stock: Math.max(0, row.stock) }));
  return sortShirtSizes(mapped.map((row) => row.size)).map(
    (size) => mapped.find((row) => row.size === size)!
  );
}

export function getSizeStock(product: Product, size: ShirtSize): number {
  const option = product.size_options?.find((o) => o.size === size);
  return option ? Math.max(0, option.stock) : 0;
}

export function getProductStock(product: Product, size?: ShirtSize | null): number {
  if (product.is_shirt) {
    if (size) return getSizeStock(product, size);
    return sumSizeStocks(product.size_options ?? []);
  }
  return Math.max(0, Number.isFinite(product.stock) ? product.stock : 0);
}

export function hasAnyStock(product: Product): boolean {
  return getProductStock(product) > 0;
}

export function attachSizeOptions<T extends { is_shirt?: boolean; product_sizes?: { size: string; stock: number }[] | null }>(
  row: T
): Omit<T, 'product_sizes'> & { size_options?: { size: ShirtSize; stock: number }[] } {
  const { product_sizes, ...rest } = row;
  if (!rest.is_shirt) {
    return rest;
  }
  return {
    ...rest,
    size_options: mapProductSizesFromRows(product_sizes ?? []),
  };
}
