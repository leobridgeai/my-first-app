"use client";

import { useState } from "react";
import Image from "next/image";
import Lightbox from "./Lightbox";

interface Photo {
  id: string;
  title?: string | null;
  description?: string | null;
  cloudinaryUrl: string;
  width: number;
  height: number;
}

interface PhotoGridProps {
  photos: Photo[];
  layout?: "masonry" | "grid";
}

export default function PhotoGrid({ photos, layout = "masonry" }: PhotoGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (photos.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="text-white/30 text-sm tracking-[0.2em] uppercase">No photos yet.</p>
      </div>
    );
  }

  return (
    <>
      {layout === "masonry" ? (
        <div className="masonry-grid">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className="animate-slide-up group cursor-pointer overflow-hidden"
              style={{ animationDelay: `${index * 60}ms` }}
              onClick={() => setLightboxIndex(index)}
            >
              <div className="relative overflow-hidden">
                <Image
                  src={photo.cloudinaryUrl}
                  alt={photo.title || "Portrait"}
                  width={photo.width}
                  height={photo.height}
                  className="w-full h-auto photo-harsh transition-transform duration-500 group-hover:scale-[1.05]"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  loading="lazy"
                />
                {/* Hover overlay - harsh */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300 flex items-end">
                  {photo.title && (
                    <div className="p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-400">
                      <p className="text-white text-[10px] tracking-[0.2em] uppercase font-medium">
                        {photo.title}
                      </p>
                    </div>
                  )}
                </div>
                {/* Vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,rgba(0,0,0,0.3)_100%)] pointer-events-none" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className="animate-slide-up group cursor-pointer overflow-hidden aspect-[3/4]"
              style={{ animationDelay: `${index * 60}ms` }}
              onClick={() => setLightboxIndex(index)}
            >
              <div className="relative w-full h-full overflow-hidden">
                <Image
                  src={photo.cloudinaryUrl}
                  alt={photo.title || "Portrait"}
                  fill
                  className="object-cover photo-harsh transition-transform duration-500 group-hover:scale-[1.05]"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300 flex items-end">
                  {photo.title && (
                    <div className="p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-400">
                      <p className="text-white text-[10px] tracking-[0.2em] uppercase font-medium">
                        {photo.title}
                      </p>
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,rgba(0,0,0,0.3)_100%)] pointer-events-none" />
              </div>
            </div>
          ))}
        </div>
      )}

      {lightboxIndex !== null && (
        <Lightbox
          photos={photos}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </>
  );
}
