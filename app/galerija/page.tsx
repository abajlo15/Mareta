"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { DEFAULT_GALLERY_IMAGES, fetchGalleryImages } from "@/lib/gallery";

export default function GalleryPage() {
  const [galleryImages, setGalleryImages] = useState<string[]>(DEFAULT_GALLERY_IMAGES);

  useEffect(() => {
    const loadImages = async () => {
      const images = await fetchGalleryImages();
      setGalleryImages(images);
    };
    loadImages();
  }, []);

  return (
    <div className="container mx-auto px-4 py-10 sm:py-14">
      <h1 className="text-3xl sm:text-4xl font-elegant font-bold mb-3 text-center bg-gradient-to-r from-primary-600 via-accent-500 to-primary-700 text-transparent bg-clip-text">
        Galerija
      </h1>
      <p className="text-center text-gray-600 mb-8 sm:mb-10">Mareta kolekcija kroz odabrane fotografije.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {galleryImages.map((imageSrc, index) => (
          <div key={imageSrc} className="relative aspect-[4/5] overflow-hidden rounded-xl shadow-md">
            <Image
              src={imageSrc}
              alt={`Mareta galerija ${index + 1}`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
