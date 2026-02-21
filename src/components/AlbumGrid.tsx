"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface Album {
  id: string;
  title: string;
  count: number;
  coverImage: string | null;
  href: string;
}

interface ApiAlbum {
  id: string;
  name: string;
  slug: string;
  coverPhoto?: { cloudinaryUrl: string } | null;
  photos: { photo: { cloudinaryUrl: string } }[];
  _count: { photos: number };
}

export default function AlbumGrid() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/albums")
      .then((res) => res.json())
      .then((data: ApiAlbum[]) => {
        const mapped = data.map((a) => ({
          id: a.id,
          title: a.name,
          count: a._count.photos,
          coverImage:
            a.coverPhoto?.cloudinaryUrl ??
            a.photos[0]?.photo.cloudinaryUrl ??
            null,
          href: `/work/${a.slug}`,
        }));
        setAlbums(mapped);
        setLoaded(true);
      });
  }, []);

  return (
    <div className="min-h-screen pt-28 md:pt-36 pb-32 md:pb-48">
      {/* Page header */}
      <header className="px-6 md:px-12 lg:px-16 mb-14 md:mb-20">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold tracking-[-0.02em] uppercase leading-[0.85]">
          Work
        </h1>
        <div className="harsh-divider w-16 md:w-24 mt-6" />
      </header>

      {/* Album grid */}
      <div className="px-6 md:px-10 lg:px-16 max-w-[1600px] mx-auto">
        {loaded && albums.length === 0 ? (
          <p className="text-white/30 text-sm tracking-[0.1em] uppercase font-body">
            No albums yet
          </p>
        ) : (
          <div className="album-grid">
            {albums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AlbumCard({ album }: { album: Album }) {
  return (
    <Link
      href={album.href}
      className="
        album-card group relative block overflow-hidden
        border border-white/[0.04] hover:border-white/[0.12]
        focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/50
        transition-all duration-500 ease-out
      "
    >
      {/* Image container */}
      <div className="relative overflow-hidden aspect-[3/4] md:aspect-[4/5] bg-white/[0.03]">
        {album.coverImage ? (
          <Image
            src={album.coverImage}
            alt={album.title}
            fill
            className="
              object-cover
              brightness-[0.7] contrast-[1.05]
              group-hover:brightness-[0.85] group-hover:contrast-[1.15]
              group-focus-visible:brightness-[0.85] group-focus-visible:contrast-[1.15]
              transition-all duration-700 ease-out
              scale-[1.03] group-hover:scale-100
            "
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white/10 text-xs tracking-[0.15em] uppercase">No photos</span>
          </div>
        )}
      </div>

      {/* Caption */}
      <div className="py-4 px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-[13px] md:text-sm tracking-[0.18em] uppercase font-medium text-white/50 group-hover:text-white/90 group-focus-visible:text-white/90 transition-colors duration-500">
            {album.title}
          </h2>
          <span className="block h-[1px] w-0 group-hover:w-6 group-focus-visible:w-6 bg-white/30 transition-all duration-500 ease-out" />
        </div>
        {album.count > 0 && (
          <p className="text-[10px] tracking-[0.1em] text-white/15 group-hover:text-white/35 group-focus-visible:text-white/35 transition-colors duration-500 mt-1.5 font-body">
            <span>{album.count} photos</span>
          </p>
        )}
      </div>
    </Link>
  );
}
