import type { CSSProperties } from "react";
import {
  clampZoom,
  computeMinZoom,
  ZOOM_FALLBACK_MIN,
} from "@/lib/imageDisplayMath";
import {
  DEFAULT_IMAGE_DISPLAY_SETTINGS,
  type ImageDisplaySettings,
  normalizeImageDisplaySettings,
} from "@/types/imageDisplay";

export {
  clampImageDisplaySettings,
  clampPanForZoom,
  clampZoom,
  computeMinZoom,
  formatZoomLabel,
  ZOOM_MAX,
  ZOOM_FALLBACK_MIN,
} from "@/lib/imageDisplayMath";

const COVER_THRESHOLD = 0.995;

export function toCoverImageStyle(
  settings?: ImageDisplaySettings | null,
  options?: {
    frameAspect?: number;
    imageSize?: { width: number; height: number } | null;
  }
): CSSProperties {
  const frameAspect = options?.frameAspect;
  const minZoom =
    options?.imageSize && frameAspect
      ? computeMinZoom(
          options.imageSize.width,
          options.imageSize.height,
          frameAspect
        )
      : ZOOM_FALLBACK_MIN;

  const { focalX, focalY, zoom } = normalizeImageDisplaySettings(
    settings ?? DEFAULT_IMAGE_DISPLAY_SETTINGS,
    minZoom
  );

  const effectiveZoom = clampZoom(zoom, minZoom);
  const origin = `${focalX}% ${focalY}%`;
  const position = `${focalX}% ${focalY}%`;

  // Below 100%: show the real full image (contain), scale up toward cover crop.
  if (effectiveZoom < COVER_THRESHOLD) {
    const containScale = minZoom > 0 ? effectiveZoom / minZoom : 1;
    return {
      objectFit: "contain",
      objectPosition: position,
      transform:
        Math.abs(containScale - 1) > 0.001 ? `scale(${containScale})` : undefined,
      transformOrigin: origin,
    };
  }

  // 100%+: fill the frame (cover), optional extra zoom in.
  return {
    objectFit: "cover",
    objectPosition: position,
    transform: effectiveZoom > 1.001 ? `scale(${effectiveZoom})` : undefined,
    transformOrigin: origin,
  };
}
