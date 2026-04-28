export const DEFAULT_GALLERY_IMAGES = Array.from(
  { length: 10 },
  (_, index) => `/slika${index + 1}.jpeg`
);

export type GalleryImageRow = {
  id: string;
  image_url: string;
};

export async function fetchGalleryImages(): Promise<string[]> {
  try {
    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const response = await fetch(`${baseUrl}/api/gallery-images`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return DEFAULT_GALLERY_IMAGES;
    }

    const data = (await response.json()) as GalleryImageRow[] | null;
    const images = Array.isArray(data)
      ? data
          .map((item) => item.image_url)
          .filter((item): item is string => typeof item === "string" && !!item.trim())
      : [];

    return images.length ? images : DEFAULT_GALLERY_IMAGES;
  } catch {
    return DEFAULT_GALLERY_IMAGES;
  }
}
