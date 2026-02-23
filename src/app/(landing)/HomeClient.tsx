"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary-url";

interface HomeClientProps {
  heroImageUrl: string | null;
  heroPublicId: string | null;
}

export default function HomeClient({ heroImageUrl }: HomeClientProps) {
  const router = useRouter();

  // On mobile, skip the landing page and go straight to albums
  useEffect(() => {
    if (window.innerWidth < 768) {
      router.replace("/work");
    }
  }, [router]);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {heroImageUrl ? (
        <Image
          src={optimizeCloudinaryUrl(heroImageUrl, { width: 1920 })}
          alt="Featured photograph"
          fill
          className="object-cover"
          priority
          sizes="100vw"
          unoptimized={heroImageUrl.startsWith("/")}
        />
      ) : (
        <div className="absolute inset-0 bg-black" />
      )}

      <Link
        href="/work"
        className="absolute bottom-8 right-8 md:bottom-12 md:right-12 text-white text-sm md:text-base tracking-widest uppercase hover:opacity-70 transition-opacity duration-200"
      >
        Enter &gt;
      </Link>
    </div>
  );
}
