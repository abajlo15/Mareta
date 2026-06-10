import { getProductColor } from "@/lib/productColors";

type ColorSwatchProps = {
  colorKey?: string | null;
  hex?: string | null;
  className?: string;
};

export default function ColorSwatch({ colorKey, hex, className = "" }: ColorSwatchProps) {
  const color = getProductColor(colorKey ?? undefined);
  const style: React.CSSProperties = color
    ? color.swatchBackground
    : hex
      ? { backgroundColor: hex }
      : { backgroundColor: "#e5e7eb" };

  return (
    <span
      className={`inline-block h-5 w-5 shrink-0 rounded-full border border-slate-300 ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}
