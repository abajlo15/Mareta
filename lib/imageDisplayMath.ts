import type { ImageDisplaySettings } from "@/types/imageDisplay";

export const ZOOM_MAX = 3;
export const ZOOM_FALLBACK_MIN = 0.2;

/** Minimum zoom (relative to cover=1) so the full image fits inside the frame. */
export function computeMinZoom(
  imageWidth: number,
  imageHeight: number,
  frameAspect: number
): number {
  if (!imageWidth || !imageHeight || !frameAspect) {
    return ZOOM_FALLBACK_MIN;
  }

  const imageAspect = imageWidth / imageHeight;

  if (imageAspect > frameAspect) {
    return frameAspect / imageAspect;
  }

  return imageAspect / frameAspect;
}

export function clampZoom(
  zoom: number,
  minZoom: number,
  maxZoom = ZOOM_MAX
): number {
  const safeMin = Math.min(minZoom, 1);
  return Math.min(maxZoom, Math.max(safeMin, zoom));
}

export function clampPanForZoom(
  focalX: number,
  focalY: number,
  zoom: number,
  minZoom: number
): { focalX: number; focalY: number } {
  const z = clampZoom(zoom, minZoom);

  if (z <= minZoom + 0.001) {
    return {
      focalX: Math.min(100, Math.max(0, focalX)),
      focalY: Math.min(100, Math.max(0, focalY)),
    };
  }

  if (z <= 1) {
    const t = (z - minZoom) / Math.max(1 - minZoom, 0.001);
    const maxOffset = 50 * (1 - t);
    return {
      focalX: Math.min(50 + maxOffset, Math.max(50 - maxOffset, focalX)),
      focalY: Math.min(50 + maxOffset, Math.max(50 - maxOffset, focalY)),
    };
  }

  const maxOffset = ((z - 1) / z) * 50;
  return {
    focalX: Math.min(50 + maxOffset, Math.max(50 - maxOffset, focalX)),
    focalY: Math.min(50 + maxOffset, Math.max(50 - maxOffset, focalY)),
  };
}

export function clampImageDisplaySettings(
  settings: ImageDisplaySettings,
  frameAspect: number,
  imageSize?: { width: number; height: number } | null
): ImageDisplaySettings {
  const minZoom = imageSize
    ? computeMinZoom(imageSize.width, imageSize.height, frameAspect)
    : ZOOM_FALLBACK_MIN;
  const zoom = clampZoom(settings.zoom, minZoom);
  const pan = clampPanForZoom(settings.focalX, settings.focalY, zoom, minZoom);

  return {
    focalX: pan.focalX,
    focalY: pan.focalY,
    zoom,
  };
}

/** User-facing zoom label: min = cijela slika, 1 = puni okvir (cover). */
export function formatZoomLabel(zoom: number, minZoom: number): string {
  if (zoom <= minZoom + 0.02) {
    return "Cijela slika";
  }
  if (zoom < 1) {
    return `${Math.round(((zoom - minZoom) / (1 - minZoom)) * 100)}%`;
  }
  return `${Math.round(zoom * 100)}%`;
}
