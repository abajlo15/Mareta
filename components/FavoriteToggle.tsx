'use client';

import { useEffect, useState } from 'react';
import { isFavorite, toggleFavorite, subscribeToFavoritesUpdate } from '@/lib/favorites';

type FavoriteToggleProps = {
  productId: string;
};

export default function FavoriteToggle({ productId }: FavoriteToggleProps) {
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    const refresh = () => setFavorite(isFavorite(productId));
    refresh();
    return subscribeToFavoritesUpdate(refresh);
  }, [productId]);

  return (
    <button
      type="button"
      aria-label={favorite ? 'Ukloni iz favorita' : 'Dodaj u favorite'}
      title={favorite ? 'Ukloni iz favorita' : 'Dodaj u favorite'}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(productId);
      }}
      className="absolute top-3 right-3 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow"
    >
      <svg
        className={`w-5 h-5 ${favorite ? 'text-red-500' : 'text-gray-500'}`}
        viewBox="0 0 24 24"
        fill={favorite ? 'currentColor' : 'none'}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"
        />
      </svg>
    </button>
  );
}
