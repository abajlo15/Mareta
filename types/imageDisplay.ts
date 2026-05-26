export type ImageDisplaySettings = {
  focalX: number;
  focalY: number;
  zoom: number;
};

export type ImageDisplayPreset = "productCard" | "gallery" | "hero" | "collectionTile";

export const DEFAULT_IMAGE_DISPLAY_SETTINGS: ImageDisplaySettings = {
  focalX: 50,
  focalY: 50,
  zoom: 1,
};

export const IMAGE_DISPLAY_PRESET_ASPECT: Record<ImageDisplayPreset, number> = {
  productCard: 5 / 4,
  gallery: 4 / 5,
  hero: 16 / 9,
  collectionTile: 13 / 11,
};

export type ImageSettingsMap = Record<string, ImageDisplaySettings>;

export function normalizeImageDisplaySettings(
  value: unknown,
  minZoom = 0.2
): ImageDisplaySettings {
  if (!value || typeof value !== "object") {
    return { ...DEFAULT_IMAGE_DISPLAY_SETTINGS };
  }

  const raw = value as Record<string, unknown>;
  const focalX =
    typeof raw.focalX === "number"
      ? raw.focalX
      : typeof raw.focal_x === "number"
        ? raw.focal_x
        : DEFAULT_IMAGE_DISPLAY_SETTINGS.focalX;
  const focalY =
    typeof raw.focalY === "number"
      ? raw.focalY
      : typeof raw.focal_y === "number"
        ? raw.focal_y
        : DEFAULT_IMAGE_DISPLAY_SETTINGS.focalY;
  const zoom =
    typeof raw.zoom === "number" ? raw.zoom : DEFAULT_IMAGE_DISPLAY_SETTINGS.zoom;

  return {
    focalX: Math.min(100, Math.max(0, focalX)),
    focalY: Math.min(100, Math.max(0, focalY)),
    zoom: Math.min(3, Math.max(minZoom, zoom)),
  };
}

export function getImageSettings(
  map: ImageSettingsMap | null | undefined,
  url: string
): ImageDisplaySettings {
  if (!map || !url) {
    return { ...DEFAULT_IMAGE_DISPLAY_SETTINGS };
  }
  return normalizeImageDisplaySettings(map[url]);
}

export function settingsFromRowFields(row: {
  focal_x?: number | null;
  focal_y?: number | null;
  zoom?: number | null;
}): ImageDisplaySettings {
  return normalizeImageDisplaySettings({
    focalX: row.focal_x,
    focalY: row.focal_y,
    zoom: row.zoom,
  });
}

export function settingsToRowFields(settings: ImageDisplaySettings) {
  const normalized = normalizeImageDisplaySettings(settings);
  return {
    focal_x: normalized.focalX,
    focal_y: normalized.focalY,
    zoom: normalized.zoom,
  };
}

export function parseImageSettingsMap(value: unknown): ImageSettingsMap {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const result: ImageSettingsMap = {};
  for (const [url, settings] of Object.entries(value as Record<string, unknown>)) {
    if (typeof url === "string" && url.trim()) {
      result[url] = normalizeImageDisplaySettings(settings);
    }
  }
  return result;
}

export function pruneImageSettingsMap(
  map: ImageSettingsMap,
  urls: string[]
): ImageSettingsMap {
  const urlSet = new Set(urls);
  const next: ImageSettingsMap = {};
  for (const url of urls) {
    if (map[url]) {
      next[url] = map[url];
    }
  }
  for (const [url, settings] of Object.entries(map)) {
    if (urlSet.has(url) && !next[url]) {
      next[url] = settings;
    }
  }
  return next;
}
