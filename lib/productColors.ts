import type { CSSProperties } from "react";

export type ProductColor = {
  key: string;
  name: string;
  hex: string;
  swatchBackground: CSSProperties;
};

export const PRODUCT_COLORS: ProductColor[] = [
  { key: "black", name: "Crna", hex: "#1a1a1a", swatchBackground: { backgroundColor: "#1a1a1a" } },
  { key: "brown", name: "Smeđa", hex: "#8B4513", swatchBackground: { backgroundColor: "#8B4513" } },
  { key: "yellow", name: "Žuta", hex: "#FFD700", swatchBackground: { backgroundColor: "#FFD700" } },
  { key: "gold", name: "Zlatna", hex: "#D4AF37", swatchBackground: { backgroundColor: "#D4AF37" } },
  { key: "silver", name: "Srebrna", hex: "#C0C0C0", swatchBackground: { backgroundColor: "#C0C0C0" } },
  { key: "red", name: "Crvena", hex: "#DC2626", swatchBackground: { backgroundColor: "#DC2626" } },
  { key: "blue", name: "Plava", hex: "#2563EB", swatchBackground: { backgroundColor: "#2563EB" } },
  { key: "green", name: "Zelena", hex: "#16A34A", swatchBackground: { backgroundColor: "#16A34A" } },
  { key: "pink", name: "Roza", hex: "#EC4899", swatchBackground: { backgroundColor: "#EC4899" } },
  { key: "cream", name: "Krem", hex: "#F5E6D3", swatchBackground: { backgroundColor: "#F5E6D3" } },
  { key: "turquoise", name: "Tirkizna", hex: "#14B8A6", swatchBackground: { backgroundColor: "#14B8A6" } },
  { key: "orange", name: "Narančasta", hex: "#EA580C", swatchBackground: { backgroundColor: "#EA580C" } },
  {
    key: "leopard",
    name: "Leopard",
    hex: "#C4A35A",
    swatchBackground: {
      background:
        "linear-gradient(135deg, #C4A35A 0%, #8B6914 25%, #D4B86A 50%, #6B4F1D 75%, #C4A35A 100%)",
    },
  },
  {
    key: "transparent",
    name: "Prozirna",
    hex: "#E5E7EB",
    swatchBackground: {
      backgroundColor: "#E5E7EB",
      backgroundImage:
        "linear-gradient(45deg, #d1d5db 25%, transparent 25%, transparent 75%, #d1d5db 75%), linear-gradient(45deg, #d1d5db 25%, transparent 25%, transparent 75%, #d1d5db 75%)",
      backgroundSize: "6px 6px",
      backgroundPosition: "0 0, 3px 3px",
    },
  },
];

const colorByKey = new Map(PRODUCT_COLORS.map((color) => [color.key, color]));

const colorByName = new Map(
  PRODUCT_COLORS.map((color) => [color.name.toLowerCase(), color])
);

export function isValidProductColorKey(key: string): boolean {
  return colorByKey.has(key);
}

export function getProductColor(key: string | null | undefined): ProductColor | undefined {
  if (!key) return undefined;
  return colorByKey.get(key);
}

export function getProductColorLabel(key: string | null | undefined): string {
  return getProductColor(key)?.name ?? "";
}

/** Best-effort match for legacy free-text labels (e.g. "Lora – žuta" → yellow). */
export function matchProductColorFromLabel(label: string | null | undefined): ProductColor | undefined {
  if (!label?.trim()) return undefined;

  const normalized = label.trim().toLowerCase();

  const direct = colorByName.get(normalized);
  if (direct) return direct;

  for (const color of PRODUCT_COLORS) {
    if (normalized.includes(color.name.toLowerCase())) {
      return color;
    }
  }

  return undefined;
}
