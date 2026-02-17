"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import PhotoGrid from "@/components/PhotoGrid";

interface Photo {
  id: string;
  title: string | null;
  description: string | null;
  cloudinaryUrl: string;
  width: number;
  height: number;
}

interface HomeClientProps {
  featuredPhotos: Photo[];
  recentPhotos: Photo[];
}

export default function HomeClient({
  featuredPhotos,
  recentPhotos,
}: HomeClientProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (featuredPhotos.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredPhotos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [featuredPhotos.length]);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[85vh] bg-gray-50 overflow-hidden">
        {featuredPhotos.length > 0 ? (
          <>
            {featuredPhotos.map((photo, index) => (
              <div
                key={photo.id}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentSlide ? "opacity-100" : "opacity-0"
                }`}
              >
                <Image
                  src={photo.cloudinaryUrl}
                  alt={photo.title || "Featured portrait"}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  sizes="100vw"
                />
              </div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/40" />
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
              <h1 className="text-white text-4xl md:text-6xl font-heading tracking-tight">
                Portrait Photography
              </h1>
              <p className="text-white/80 mt-3 text-lg max-w-md">
                Capturing authentic moments and timeless portraits.
              </p>
              <Link
                href="/portfolio"
                className="inline-block mt-6 px-6 py-3 border border-white/60 text-white text-sm tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-300"
              >
                View Portfolio
              </Link>
            </div>
            {/* Slide indicators */}
            {featuredPhotos.length > 1 && (
              <div className="absolute bottom-8 right-8 md:right-16 flex gap-2">
                {featuredPhotos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentSlide
                        ? "bg-white w-6"
                        : "bg-white/40 hover:bg-white/60"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center px-6">
              <h1 className="text-4xl md:text-6xl font-heading tracking-tight">
                Portrait Photography
              </h1>
              <p className="text-muted mt-4 text-lg max-w-md mx-auto">
                Capturing authentic moments and timeless portraits.
              </p>
              <Link
                href="/portfolio"
                className="inline-block mt-8 px-6 py-3 border border-foreground text-sm tracking-widest uppercase hover:bg-foreground hover:text-white transition-all duration-300"
              >
                View Portfolio
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Recent Work */}
      {recentPhotos.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-heading">Recent Work</h2>
            <Link
              href="/portfolio"
              className="text-sm text-muted hover:text-foreground tracking-widest uppercase transition-colors"
            >
              View All
            </Link>
          </div>
          <PhotoGrid photos={recentPhotos} layout="grid" />
        </section>
      )}
    </div>
  );
}
