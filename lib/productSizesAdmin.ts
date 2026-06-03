import type { SupabaseClient } from '@supabase/supabase-js';
import { normalizeSizeStocks, sumSizeStocks, type ShirtSize } from '@/lib/shirtSizes';

export function resolveProductStockFields(
  isShirt: boolean,
  stock: number | undefined,
  sizeStocksInput: unknown
): { ok: true; is_shirt: boolean; stock: number; sizeStocks: { size: ShirtSize; stock: number }[] } | { ok: false; error: string } {
  if (!isShirt) {
    const stockValue = typeof stock === 'number' ? Math.max(0, Math.floor(stock)) : 0;
    return { ok: true, is_shirt: false, stock: stockValue, sizeStocks: [] };
  }

  const normalized = normalizeSizeStocks(sizeStocksInput);
  if (!normalized.ok) {
    return normalized;
  }

  return {
    ok: true,
    is_shirt: true,
    stock: sumSizeStocks(normalized.sizeStocks),
    sizeStocks: normalized.sizeStocks,
  };
}

export async function syncProductSizes(
  supabase: SupabaseClient,
  productId: string,
  isShirt: boolean,
  sizeStocks: { size: ShirtSize; stock: number }[]
): Promise<{ error: string | null }> {
  const { error: deleteError } = await supabase.from('product_sizes').delete().eq('product_id', productId);
  if (deleteError) {
    return { error: deleteError.message };
  }

  if (!isShirt || sizeStocks.length === 0) {
    return { error: null };
  }

  const rows = sizeStocks.map((row) => ({
    product_id: productId,
    size: row.size,
    stock: row.stock,
  }));

  const { error: insertError } = await supabase.from('product_sizes').insert(rows);
  if (insertError) {
    return { error: insertError.message };
  }

  return { error: null };
}
