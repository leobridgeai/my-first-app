"use client";

import Image from "next/image";
import Link from "next/link";

interface HomeClientProps {
  heroImageUrl: string | null;
  heroPublicId: string | null;
}

export default function HomeClient({ heroImageUrl }: HomeClientProps) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* Full-screen hero image with harsh contrast */}
      {heroImageUrl ? (
        <Image
          src={heroImageUrl}
          alt="Featured photograph"
          fill
          className="object-cover photo-harsh"
          priority
          sizes="100vw"
        />
      ) : (
        <div className="absolute inset-0 bg-black" />
      )}

      {/* Dark overlay - heavier for dramatic effect */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Harsh vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.8)_100%)]" />

      {/* Content overlay - bold, confrontational */}
      <div className="absolute inset-0 flex flex-col justify-end">
        <div className="px-6 md:px-12 pb-20 md:pb-28 max-w-[1400px] mx-auto w-full">
          <div className="animate-flicker">
            <h1 className="text-white text-6xl md:text-8xl lg:text-[10rem] font-heading font-bold tracking-[-0.02em] leading-[0.85] uppercase">
              Faces
            </h1>
            <div className="harsh-divider w-24 md:w-40 mt-6 mb-6" />
            <p className="text-white/50 text-xs md:text-sm tracking-[0.3em] uppercase max-w-md font-medium">
              Up close. No apologies.
            </p>
          </div>
          <Link
            href="/work"
            className="inline-block mt-10 px-8 py-3 text-[11px] tracking-[0.3em] uppercase text-black bg-white hover:bg-white/90 transition-all duration-200 font-semibold"
          >
            Enter
          </Link>
        </div>
      </div>

      {/* Bottom edge line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10" />
    </div>
  );
}
