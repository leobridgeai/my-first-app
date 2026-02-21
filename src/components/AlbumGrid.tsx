"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface Album {
  id: string;
  title: string;
  count: number;
  coverImage: string | null;
  coverWidth: number;
  coverHeight: number;
  href: string;
}

interface ApiAlbum {
  id: string;
  name: string;
  slug: string;
  coverPhoto?: { cloudinaryUrl: string; width: number; height: number } | null;
  photos: { photo: { cloudinaryUrl: string; width: number; height: number } }[];
  _count: { photos: number };
}

/*
 * Deterministic layout pattern — repeating every 5 albums.
 * Grid columns define the structural rhythm; image heights
 * adapt naturally to each photograph's real proportions.
 *
 * Desktop (12-col grid):
 *   Row A:  [═══ 7 cols ═══] [═══ 5 cols ═══]
 *           slot 0 (hero)     slot 1
 *   Row B:  [4 cols] [4 cols] [4 cols]
 *           slot 2   slot 3   slot 4
 *
 * Tablet (2-col):  slot 0 spans full, slots 1–4 span 1
 * Mobile (1-col):  all full-width
 */
const LAYOUT_PATTERN: {
  desktop: { gridColumn: string };
  tablet: { gridColumn: string };
}[] = [
  { desktop: { gridColumn: "1 / span 7" }, tablet: { gridColumn: "1 / -1" } },
  { desktop: { gridColumn: "8 / span 5" }, tablet: { gridColumn: "span 1" } },
  { desktop: { gridColumn: "1 / span 4" }, tablet: { gridColumn: "span 1" } },
  { desktop: { gridColumn: "5 / span 4" }, tablet: { gridColumn: "span 1" } },
  { desktop: { gridColumn: "9 / span 4" }, tablet: { gridColumn: "span 1" } },
];

function getSlotLayout(index: number) {
  return LAYOUT_PATTERN[index % LAYOUT_PATTERN.length];
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
          coverWidth:
            a.coverPhoto?.width ?? a.photos[0]?.photo.width ?? 4,
          coverHeight:
            a.coverPhoto?.height ?? a.photos[0]?.photo.height ?? 5,
          href: `/work/${a.slug}`,
        }));
        setAlbums(mapped);
        setLoaded(true);
      });
  }, []);

  return (
    <div className="min-h-screen pt-28 md:pt-40 pb-32 md:pb-56">
      {/* Page header */}
      <header className="px-8 md:px-14 lg:px-20 mb-20 md:mb-28">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold tracking-[-0.02em] uppercase leading-[0.85]">
          Work
        </h1>
        <div className="harsh-divider w-16 md:w-24 mt-6" />
      </header>

      {/* Album grid */}
      <div className="px-8 md:px-14 lg:px-20 max-w-[1600px] mx-auto">
        {loaded && albums.length === 0 ? (
          <p className="text-white/30 text-sm tracking-[0.1em] uppercase font-body">
            No albums yet
          </p>
        ) : (
          <div className="album-grid">
            {albums.map((album, index) => (
              <AlbumCard key={album.id} album={album} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AlbumCard({ album, index }: { album: Album; index: number }) {
  const layout = getSlotLayout(index);
  const isHero = index % LAYOUT_PATTERN.length === 0;

  return (
    <Link
      href={album.href}
      className="album-card group relative block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/50 transition-all duration-500 ease-out"
      style={
        {
          "--grid-col-tablet": layout.tablet.gridColumn,
          "--grid-col-desktop": layout.desktop.gridColumn,
        } as React.CSSProperties
      }
    >
      {/* Image — natural proportions, no cropping */}
      <div className="relative overflow-hidden bg-white/[0.03]">
        {album.coverImage ? (
          <Image
            src={album.coverImage}
            alt={album.title}
            width={album.coverWidth}
            height={album.coverHeight}
            className="w-full h-auto brightness-[0.7] contrast-[1.05] group-hover:brightness-[0.85] group-hover:contrast-[1.15] group-focus-visible:brightness-[0.85] group-focus-visible:contrast-[1.15] transition-all duration-700 ease-out scale-[1.02] group-hover:scale-100"
            sizes={
              isHero
                ? "(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 60vw"
                : "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            }
          />
        ) : (
          <div
            className="flex items-center justify-center"
            style={{ aspectRatio: "4/5" }}
          >
            <span className="text-white/10 text-xs tracking-[0.15em] uppercase">
              No photos
            </span>
          </div>
        )}
      </div>

      {/* Caption */}
      <div className="py-5 md:py-6 px-1">
        <div className="flex items-center gap-2">
          <h2
            className={`tracking-[0.18em] uppercase font-medium text-white/50 group-hover:text-white/90 group-focus-visible:text-white/90 transition-colors duration-500 ${
              isHero
                ? "text-sm md:text-base"
                : "text-[13px] md:text-sm"
            }`}
          >
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
