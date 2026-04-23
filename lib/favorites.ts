const FAVORITES_STORAGE_KEY = 'mareta_favorites';
const FAVORITES_UPDATED_EVENT = 'favoritesUpdated';

function canUseStorage() {
  return typeof window !== 'undefined';
}

export function getFavoriteProductIds(): string[] {
  if (!canUseStorage()) return [];

  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === 'string');
  } catch {
    return [];
  }
}

export function isFavorite(productId: string): boolean {
  return getFavoriteProductIds().includes(productId);
}

export function toggleFavorite(productId: string): string[] {
  const current = getFavoriteProductIds();
  const updated = current.includes(productId)
    ? current.filter((id) => id !== productId)
    : [...current, productId];

  if (canUseStorage()) {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event(FAVORITES_UPDATED_EVENT));
  }

  return updated;
}

export function subscribeToFavoritesUpdate(callback: () => void): () => void {
  if (!canUseStorage()) return () => {};

  const onStorage = (event: StorageEvent) => {
    if (event.key === FAVORITES_STORAGE_KEY) callback();
  };

  window.addEventListener('storage', onStorage);
  window.addEventListener(FAVORITES_UPDATED_EVENT, callback);

  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(FAVORITES_UPDATED_EVENT, callback);
  };
}
