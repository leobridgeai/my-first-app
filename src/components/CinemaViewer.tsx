"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";

interface Photo {
  id: string;
  title?: string | null;
  cloudinaryUrl: string;
  width: number;
  height: number;
}

interface CinemaViewerProps {
  photos: Photo[];
}

export default function CinemaViewer({ photos }: CinemaViewerProps) {
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

  return (
    <div className="h-screen flex flex-col select-none">
      {/* Main image area */}
      <div className="flex-1 relative flex items-center justify-center min-h-0 px-14 md:px-24 pt-16">
        {/* Previous arrow */}
        {currentIndex > 0 && (
          <button
            onClick={goPrev}
            className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-10 text-white/10 hover:text-white/50 transition-colors duration-500 p-2"
            aria-label="Previous"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}

        {/* The photograph — projected onto the dark canvas */}
        <Image
          key={photo.id}
          src={photo.cloudinaryUrl}
          alt={photo.title || "Photograph"}
          width={photo.width || 1200}
          height={photo.height || 800}
          className="max-w-full max-h-full object-contain transition-opacity duration-500"
          style={{ maxHeight: "calc(100vh - 160px)" }}
          priority={currentIndex < 2}
          sizes="85vw"
        />

        {/* Next arrow */}
        {currentIndex < photos.length - 1 && (
          <button
            onClick={goNext}
            className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-10 text-white/10 hover:text-white/50 transition-colors duration-500 p-2"
            aria-label="Next"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Thumbnail filmstrip */}
      <div className="flex-shrink-0 py-3 md:py-5">
        <div
          ref={thumbsRef}
          className="flex items-center justify-center gap-1 md:gap-1.5 overflow-x-auto px-6 cinema-thumbstrip"
        >
          {photos.map((p, i) => {
            const thumbW =
              p.width && p.height
                ? Math.round((p.width / p.height) * THUMB_H)
                : THUMB_H;
            return (
              <button
                key={p.id}
                onClick={() => setCurrentIndex(i)}
                className={`flex-shrink-0 overflow-hidden transition-opacity duration-500 ${
                  i === currentIndex
                    ? "opacity-100"
                    : "opacity-20 hover:opacity-45"
                }`}
              >
                <Image
                  src={p.cloudinaryUrl}
                  alt=""
                  width={thumbW}
                  height={THUMB_H}
                  className="block object-cover"
                  style={{ height: THUMB_H, width: thumbW }}
                  sizes="80px"
                  loading="lazy"
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
