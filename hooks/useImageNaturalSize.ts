"use client";

import { useEffect, useState } from "react";

export function useImageNaturalSize(src: string | null | undefined) {
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    if (!src) {
      setSize(null);
      return;
    }

    let cancelled = false;
    const image = new window.Image();
    image.onload = () => {
      if (!cancelled && image.naturalWidth && image.naturalHeight) {
        setSize({ width: image.naturalWidth, height: image.naturalHeight });
      }
    };
    image.onerror = () => {
      if (!cancelled) setSize(null);
    };
    image.src = src;

    return () => {
      cancelled = true;
    };
  }, [src]);

  return size;
}
