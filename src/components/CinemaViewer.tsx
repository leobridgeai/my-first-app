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
    setCurrentIndex((i) => (i + 1) % photos.length);
  }, [photos.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => (i - 1 + photos.length) % photos.length);
  }, [photos.length]);

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

  return (
    <div className="h-screen flex flex-col select-none overflow-hidden">
      {/* Header — album title + back link + counter */}
      <div className="flex-shrink-0 pt-28 md:pt-32 pb-6 md:pb-8 px-20 md:px-32 flex items-baseline justify-between">
        <div className="flex items-baseline gap-4">
          <Link
            href="/work"
            className="text-white/30 hover:text-white/60 transition-colors duration-300 text-xs tracking-[0.2em] uppercase"
          >
            &larr; Work
          </Link>
          {albumName && (
            <h2 className="text-white text-2xl md:text-3xl font-bold tracking-normal" style={{ fontFamily: "var(--font-body), system-ui, sans-serif" }}>
              {albumName}
            </h2>
          )}
        </div>
      </div>

      {/* Main image area — generous margins for exhibition framing */}
      <div className={`flex-1 relative flex items-center justify-center min-h-0 overflow-hidden px-20 md:px-32 pt-0 pb-4`}>
        {/* Previous arrow */}
        <button
          onClick={goPrev}
          className="absolute left-12 md:left-20 top-1/2 -translate-y-1/2 z-10 text-white/60 hover:text-white/90 transition-colors duration-300 p-2"
          aria-label="Previous photo"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* The photograph — framed within generous black space */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={photo.id}
          src={optimizeCloudinaryUrl(photo.cloudinaryUrl, { width: 1600 })}
          alt={photo.title || "Photograph"}
          className="max-w-full max-h-full object-contain transition-opacity duration-500"
          style={{ maxHeight: "calc(100vh - 240px)", maxWidth: "calc(100vw - 200px)" }}
        />

        {/* Next arrow */}
        <button
          onClick={goNext}
          className="absolute right-12 md:right-20 top-1/2 -translate-y-1/2 z-10 text-white/60 hover:text-white/90 transition-colors duration-300 p-2"
          aria-label="Next photo"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
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
              className={`flex-shrink-0 overflow-hidden transition-opacity duration-500 ${
                i === currentIndex
                  ? "opacity-100"
                  : "opacity-20 hover:opacity-45"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={optimizeCloudinaryUrl(p.cloudinaryUrl, { height: 150 })}
                alt=""
                className="block"
                style={{ height: THUMB_H, width: Math.round(THUMB_H * (p.width / p.height)) }}
                loading="lazy"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
