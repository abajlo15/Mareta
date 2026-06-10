"use client";

import { useRouter } from "next/navigation";
import ColorSelect, { type ColorSelectOption } from "@/components/ColorSelect";

type ColorVariantSelectProps = {
  currentProductId: string;
  variants?: {
    product_id: string;
    label: string;
    color_key?: string;
    hex?: string;
  }[];
};

export default function ColorVariantSelect({
  currentProductId,
  variants,
}: ColorVariantSelectProps) {
  const router = useRouter();

  if (!variants || variants.length < 2) {
    return null;
  }

  const currentVariant = variants.find((v) => v.product_id === currentProductId);
  const currentKey = currentVariant?.color_key ?? "";

  const options: ColorSelectOption[] = variants.map((variant) => ({
    key: variant.color_key ?? variant.product_id,
    label: variant.label,
    hex: variant.hex,
  }));

  const handleChange = (selectedKey: string) => {
    const variant = variants.find(
      (v) => (v.color_key ?? v.product_id) === selectedKey
    );
    if (variant && variant.product_id !== currentProductId) {
      router.push(`/products/${variant.product_id}`);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">Boja</label>
      <ColorSelect
        value={currentKey || (currentVariant ? currentVariant.product_id : "")}
        onChange={handleChange}
        options={options}
        className="max-w-xs"
      />
    </div>
  );
}
