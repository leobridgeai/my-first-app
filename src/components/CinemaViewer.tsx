"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary-url";

interface Photo {
  id: string;
  title?: string | null;
  cloudinaryUrl: string;
  width: number;
  height: number;
}

interface CinemaViewerProps {
  photos: Photo[];
  albumName?: string;
}

export default function CinemaViewer({ photos, albumName }: CinemaViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const photo = photos[currentIndex];

  const goNext = useCallback(() => {
    if (currentIndex < photos.length - 1) setCurrentIndex(currentIndex + 1);
  }, [currentIndex, photos.length]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev]);

  // Scroll active thumbnail into view
  useEffect(() => {
    if (!thumbsRef.current) return;
    const activeThumb = thumbsRef.current.children[currentIndex] as HTMLElement;
    if (activeThumb) {
      activeThumb.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [currentIndex]);

  // Touch/swipe support
  useEffect(() => {
    let startX = 0;
    let startY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const diffX = e.changedTouches[0].clientX - startX;
      const diffY = e.changedTouches[0].clientY - startY;

      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        if (diffX > 0) goPrev();
        else goNext();
      }
    };

    document.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("touchend", handleTouchEnd);
    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [goNext, goPrev]);

  if (!photo || photos.length === 0) return null;

  const THUMB_H = 72;
  const THUMB_W = 72;

  return (
    <div className="h-screen flex flex-col select-none overflow-hidden bg-black text-white">
      {/* Header — album title + back link + counter */}
      <div className="flex-shrink-0 pt-20 md:pt-24 pb-4 md:pb-6 px-10 md:px-20 flex items-baseline justify-between">
        <div className="flex items-baseline gap-4">
          <Link
            href="/work"
            className="text-white/40 hover:text-white/70 text-[11px] tracking-[0.15em] uppercase"
          >
            &larr; Work
          </Link>
          {albumName && (
            <span className="text-white/80 text-[13px] tracking-[0.1em] uppercase">
              {albumName}
            </span>
          )}
        </div>
        <span className="text-white/30 text-[11px] tracking-[0.15em] tabular-nums">
          {currentIndex + 1} / {photos.length}
        </span>
      </div>

      {/* Main image area */}
      <div className="flex-1 relative flex items-center justify-center min-h-0 overflow-hidden px-10 md:px-20 pt-0 pb-4">
        {/* Previous arrow */}
        {currentIndex > 0 && (
          <button
            onClick={goPrev}
            className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 z-10 text-white/60 hover:text-white/90 p-2"
            aria-label="Previous photo"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={photo.id}
          src={optimizeCloudinaryUrl(photo.cloudinaryUrl, { width: 1600 })}
          alt={photo.title || "Photograph"}
          className="max-w-full max-h-full object-contain"
          style={{ maxHeight: "calc(100vh - 220px)", maxWidth: "calc(100vw - 120px)" }}
        />

        {/* Next arrow */}
        {currentIndex < photos.length - 1 && (
          <button
            onClick={goNext}
            className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 z-10 text-white/60 hover:text-white/90 p-2"
            aria-label="Next photo"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Thumbnail filmstrip */}
      <div className="flex-shrink-0 py-3 md:py-5">
        <div
          ref={thumbsRef}
          role="tablist"
          aria-label="Photo thumbnails"
          className="flex items-center justify-center gap-1 md:gap-1.5 overflow-x-auto px-6 cinema-thumbstrip"
        >
          {photos.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setCurrentIndex(i)}
              role="tab"
              aria-selected={i === currentIndex}
              aria-label={p.title || `Photo ${i + 1} of ${photos.length}`}
              className={`flex-shrink-0 overflow-hidden ${
                i === currentIndex
                  ? "opacity-100"
                  : "opacity-20 hover:opacity-45"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={optimizeCloudinaryUrl(p.cloudinaryUrl, { width: 150, height: 150, crop: "fill" })}
                alt=""
                className="block object-cover"
                style={{ height: THUMB_H, width: THUMB_W }}
                loading="lazy"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
