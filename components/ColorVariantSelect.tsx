"use client";

import { useRouter } from "next/navigation";

type ColorVariantSelectProps = {
  currentProductId: string;
  variants?: { product_id: string; label: string }[];
};

export default function ColorVariantSelect({
  currentProductId,
  variants,
}: ColorVariantSelectProps) {
  const router = useRouter();

  if (!variants || variants.length < 2) {
    return null;
  }

  return (
    <div className="mb-4">
      <label htmlFor="color-variant" className="block text-sm font-medium text-gray-700 mb-1">
        Boja
      </label>
      <select
        id="color-variant"
        value={currentProductId}
        onChange={(event) => {
          const nextId = event.target.value;
          if (nextId && nextId !== currentProductId) {
            router.push(`/products/${nextId}`);
          }
        }}
        className="w-full max-w-xs border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        {variants.map((variant) => (
          <option key={variant.product_id} value={variant.product_id}>
            {variant.label}
          </option>
        ))}
      </select>
    </div>
  );
}
