import {
  DEFAULT_IMAGE_DISPLAY_SETTINGS,
  settingsFromRowFields,
  type ImageDisplaySettings,
} from "@/types/imageDisplay";

export const DEFAULT_GALLERY_IMAGES = Array.from(
  { length: 10 },
  (_, index) => `/slika${index + 1}.jpeg`
);

export type GalleryImageRow = {
  id: string;
  image_url: string;
  focal_x?: number | null;
  focal_y?: number | null;
  zoom?: number | null;
};

export type GalleryImageItem = {
  url: string;
  settings: ImageDisplaySettings;
};

export async function fetchGalleryImages(): Promise<GalleryImageItem[]> {
  try {
    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const response = await fetch(`${baseUrl}/api/gallery-images`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return DEFAULT_GALLERY_IMAGES.map((url) => ({
        url,
        settings: { ...DEFAULT_IMAGE_DISPLAY_SETTINGS },
      }));
    }

    const data = (await response.json()) as GalleryImageRow[] | null;
    const images = Array.isArray(data)
      ? data
          .map((item) => {
            if (typeof item.image_url !== "string" || !item.image_url.trim()) {
              return null;
            }
            return {
              url: item.image_url,
              settings: settingsFromRowFields(item),
            };
          })
          .filter((item): item is GalleryImageItem => item !== null)
      : [];

    if (images.length) {
      return images;
    }

    return DEFAULT_GALLERY_IMAGES.map((url) => ({
      url,
      settings: { ...DEFAULT_IMAGE_DISPLAY_SETTINGS },
    }));
  } catch {
    return DEFAULT_GALLERY_IMAGES.map((url) => ({
      url,
      settings: { ...DEFAULT_IMAGE_DISPLAY_SETTINGS },
    }));
  }
}

/** @deprecated Use fetchGalleryImages for settings-aware display */
export async function fetchGalleryImageUrls(): Promise<string[]> {
  const items = await fetchGalleryImages();
  return items.map((item) => item.url);
}
