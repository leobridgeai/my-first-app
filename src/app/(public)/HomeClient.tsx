"use client";

import Image from "next/image";
import Link from "next/link";

interface HomeClientProps {
  heroImageUrl: string | null;
  heroPublicId: string | null;
}

export default function HomeClient({ heroImageUrl }: HomeClientProps) {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {/* Full-screen hero image */}
      {heroImageUrl ? (
        <Image
          src={heroImageUrl}
          alt="Featured photograph"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 to-black" />
      )}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Content overlay - bottom left */}
      <div className="absolute inset-0 flex flex-col justify-end">
        <div className="px-6 md:px-10 pb-16 md:pb-20 max-w-[1400px] mx-auto w-full">
          <h1 className="text-white text-5xl md:text-7xl lg:text-8xl font-heading tracking-tight leading-none">
            Portrait
            <br />
            Photography
          </h1>
          <p className="text-white/60 mt-4 text-sm md:text-base tracking-wide max-w-md">
            Observing people as they are.
          </p>
          <Link
            href="/work"
            className="inline-block mt-8 text-[11px] tracking-[0.25em] uppercase text-white/70 hover:text-white border-b border-white/30 hover:border-white pb-1 transition-all duration-300"
          >
            View Work
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <div className="w-[1px] h-8 bg-white/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-white/60 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
