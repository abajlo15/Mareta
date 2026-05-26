"use client";

import PositionedCoverImage from "@/components/PositionedCoverImage";
import type { ImageDisplaySettings } from "@/types/imageDisplay";

type AdminImageThumbProps = {
  url: string;
  settings?: ImageDisplaySettings | null;
  onReposition: () => void;
  onRemove?: () => void;
  removeLabel?: string;
};

export default function AdminImageThumb({
  url,
  settings,
  onReposition,
  onRemove,
  removeLabel = "×",
}: AdminImageThumbProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="relative h-16 w-16 overflow-hidden rounded border">
        <PositionedCoverImage
          src={url}
          alt=""
          settings={settings}
          preset="productCard"
          unoptimized
          sizes="64px"
        />
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="absolute -right-1 -top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white"
            aria-label="Ukloni sliku"
          >
            {removeLabel}
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={onReposition}
        className="rounded border border-slate-300 px-1 py-0.5 text-[10px] font-medium text-slate-700 hover:bg-slate-50"
      >
        Repozicioniraj
      </button>
    </div>
  );
}
