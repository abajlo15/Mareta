"use client";

import Image from "next/image";
import { useImageNaturalSize } from "@/hooks/useImageNaturalSize";
import { toCoverImageStyle } from "@/lib/positionedCoverImage";
import {
  IMAGE_DISPLAY_PRESET_ASPECT,
  type ImageDisplayPreset,
  type ImageDisplaySettings,
} from "@/types/imageDisplay";

type PositionedCoverImageProps = {
  src: string;
  alt: string;
  settings?: ImageDisplaySettings | null;
  className?: string;
  sizes?: string;
  priority?: boolean;
  hoverScale?: boolean;
  preset?: ImageDisplayPreset;
  frameAspect?: number;
  unoptimized?: boolean;
};

export default function PositionedCoverImage({
  src,
  alt,
  settings,
  className = "",
  sizes,
  priority = false,
  hoverScale = false,
  preset = "productCard",
  frameAspect: frameAspectProp,
  unoptimized = false,
}: PositionedCoverImageProps) {
  const imageSize = useImageNaturalSize(src);
  const frameAspect = frameAspectProp ?? IMAGE_DISPLAY_PRESET_ASPECT[preset];
  const imageStyle = toCoverImageStyle(settings, { frameAspect, imageSize });
  const fitClass =
    imageStyle.objectFit === "contain" ? "object-contain" : "object-cover";
  const hoverClass = hoverScale
    ? "transition-transform duration-300 group-hover:scale-110"
    : "";

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      unoptimized={unoptimized}
      className={`${fitClass} ${hoverClass} ${className}`.trim()}
      style={imageStyle}
    />
  );
}
