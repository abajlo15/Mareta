"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import PositionedCoverImage from "@/components/PositionedCoverImage";
import { useImageNaturalSize } from "@/hooks/useImageNaturalSize";
import {
  clampImageDisplaySettings,
  clampZoom,
  computeMinZoom,
  formatZoomLabel,
  ZOOM_MAX,
} from "@/lib/imageDisplayMath";
import {
  DEFAULT_IMAGE_DISPLAY_SETTINGS,
  IMAGE_DISPLAY_PRESET_ASPECT,
  type ImageDisplayPreset,
  type ImageDisplaySettings,
} from "@/types/imageDisplay";

type ImageRepositionModalProps = {
  open: boolean;
  imageUrl: string;
  preset: ImageDisplayPreset;
  initialSettings?: ImageDisplaySettings | null;
  onClose: () => void;
  onSave: (settings: ImageDisplaySettings) => void;
};

export default function ImageRepositionModal({
  open,
  imageUrl,
  preset,
  initialSettings,
  onClose,
  onSave,
}: ImageRepositionModalProps) {
  const frameAspect = IMAGE_DISPLAY_PRESET_ASPECT[preset];
  const imageSize = useImageNaturalSize(open ? imageUrl : null);
  const minZoom = useMemo(
    () =>
      imageSize
        ? computeMinZoom(imageSize.width, imageSize.height, frameAspect)
        : 0.2,
    [imageSize, frameAspect]
  );

  const [settings, setSettings] = useState<ImageDisplaySettings>(
    initialSettings ?? DEFAULT_IMAGE_DISPLAY_SETTINGS
  );
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number; focalX: number; focalY: number } | null>(
    null
  );
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      const initial = initialSettings ?? DEFAULT_IMAGE_DISPLAY_SETTINGS;
      setSettings(
        imageSize
          ? clampImageDisplaySettings(initial, frameAspect, imageSize)
          : initial
      );
    }
  }, [open, imageUrl, initialSettings, imageSize, frameAspect]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const updateSettings = (next: ImageDisplaySettings) => {
    setSettings(clampImageDisplaySettings(next, frameAspect, imageSize));
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(true);
    dragStart.current = {
      x: event.clientX,
      y: event.clientY,
      focalX: settings.focalX,
      focalY: settings.focalY,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging || !dragStart.current) return;
    const deltaX = event.clientX - dragStart.current.x;
    const deltaY = event.clientY - dragStart.current.y;
    const frame = frameRef.current;
    if (!frame) return;
    const rect = frame.getBoundingClientRect();
    const sensitivity = 0.35;
    updateSettings({
      ...settings,
      focalX: dragStart.current.focalX - (deltaX / rect.width) * 100 * sensitivity,
      focalY: dragStart.current.focalY - (deltaY / rect.height) * 100 * sensitivity,
    });
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    setDragging(false);
    dragStart.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const adjustZoom = (delta: number) => {
    updateSettings({
      ...settings,
      zoom: clampZoom(
        Math.round((settings.zoom + delta) * 100) / 100,
        minZoom
      ),
    });
  };

  const handleSave = () => {
    onSave(clampImageDisplaySettings(settings, frameAspect, imageSize));
    onClose();
  };

  const showFitFullButton = minZoom < 0.98;

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reposition-modal-title"
    >
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 id="reposition-modal-title" className="text-lg font-semibold text-slate-900">
            Namjesti prikaz slike
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Povuci sliku i smanji zoom za cijelu sliku u okviru, ili povećaj za crop.
          </p>
        </div>

        <div className="px-5 py-4">
          <div
            ref={frameRef}
            className="relative mx-auto w-full max-w-md overflow-hidden rounded-lg border-2 border-dashed border-primary-500 bg-slate-100 cursor-grab active:cursor-grabbing touch-none"
            style={{ aspectRatio: String(frameAspect) }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <PositionedCoverImage
              src={imageUrl}
              alt=""
              settings={settings}
              preset={preset}
              unoptimized
              sizes="400px"
            />
            <div className="pointer-events-none absolute inset-0 ring-2 ring-inset ring-primary-500/80" />
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            {showFitFullButton && (
              <button
                type="button"
                onClick={() => updateSettings({ ...settings, zoom: minZoom })}
                className="rounded border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Cijela slika
              </button>
            )}
            <button
              type="button"
              onClick={() => adjustZoom(-0.05)}
              disabled={settings.zoom <= minZoom + 0.01}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-xl font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              aria-label="Smanji zoom"
            >
              −
            </button>
            <input
              type="range"
              min={minZoom}
              max={ZOOM_MAX}
              step={0.05}
              value={clampZoom(settings.zoom, minZoom)}
              onChange={(event) =>
                updateSettings({ ...settings, zoom: Number(event.target.value) })
              }
              className="w-40 accent-primary-600"
              aria-label="Zoom"
            />
            <button
              type="button"
              onClick={() => adjustZoom(0.05)}
              disabled={settings.zoom >= ZOOM_MAX}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-xl font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              aria-label="Povećaj zoom"
            >
              +
            </button>
            <span className="min-w-[5rem] text-sm text-slate-600">
              {formatZoomLabel(settings.zoom, minZoom)}
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Odustani
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            Spremi
          </button>
        </div>
      </div>
    </div>
  );
}
