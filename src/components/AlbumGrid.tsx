"use client";

import Image from "next/image";
import Link from "next/link";

interface Album {
  id: string;
  title: string;
  year?: number;
  count?: number;
  coverImage: string;
  href: string;
  featured?: boolean;
}

const albums: Album[] = [
  {
    id: "1",
    title: "New York",
    year: 2024,
    count: 42,
    coverImage:
      "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b",
    href: "/work/new-york",
    featured: true,
  },
  {
    id: "2",
    title: "Paris",
    year: 2023,
    count: 28,
    coverImage:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34",
    href: "/work/paris",
  },
  {
    id: "3",
    title: "Tokyo",
    year: 2023,
    count: 35,
    coverImage:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf",
    href: "/work/tokyo",
  },
  {
    id: "4",
    title: "London",
    year: 2024,
    count: 19,
    coverImage:
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad",
    href: "/work/london",
    featured: true,
  },
  {
    id: "5",
    title: "Berlin",
    year: 2022,
    count: 31,
    coverImage:
      "https://images.unsplash.com/photo-1560969184-10fe8719e047",
    href: "/work/berlin",
  },
  {
    id: "6",
    title: "Havana",
    year: 2023,
    count: 24,
    coverImage:
      "https://images.unsplash.com/photo-1500759285222-a95c2a7b4c79",
    href: "/work/havana",
  },
  {
    id: "7",
    title: "Mumbai",
    year: 2024,
    count: 38,
    coverImage:
      "https://images.unsplash.com/photo-1570168007204-dfb528c6958f",
    href: "/work/mumbai",
    featured: true,
  },
  {
    id: "8",
    title: "Lagos",
    year: 2024,
    count: 15,
    coverImage:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
    href: "/work/lagos",
  },
];

export default function AlbumGrid() {
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
        <div className="album-grid">
          {albums.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </div>
      </div>
    </div>
  );
}

function AlbumCard({ album }: { album: Album }) {
  return (
    <Link
      href={album.href}
      className={`
        album-card group relative block overflow-hidden
        ${album.featured ? "album-card--featured" : ""}
        border border-white/[0.04] hover:border-white/[0.12]
        focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/50
        transition-all duration-500 ease-out
      `}
    >
      {/* Image container */}
      <div
        className={`
          relative overflow-hidden
          ${album.featured ? "aspect-[16/10] md:aspect-[2/1]" : "aspect-[3/4] md:aspect-[4/5]"}
        `}
      >
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
          sizes={
            album.featured
              ? "(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 66vw"
              : "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          }
        />
      </div>

      {/* Caption */}
      <div className="py-4 px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-[13px] md:text-sm tracking-[0.18em] uppercase font-medium text-white/50 group-hover:text-white/90 group-focus-visible:text-white/90 transition-colors duration-500">
            {album.title}
          </h2>
          <span className="block h-[1px] w-0 group-hover:w-6 group-focus-visible:w-6 bg-white/30 transition-all duration-500 ease-out" />
        </div>
        {(album.year || album.count) && (
          <p className="text-[10px] tracking-[0.1em] text-white/15 group-hover:text-white/35 group-focus-visible:text-white/35 transition-colors duration-500 mt-1.5 font-body">
            {album.year && <span>{album.year}</span>}
            {album.year && album.count && (
              <span className="mx-1.5 text-white/10">·</span>
            )}
            {album.count && <span>{album.count} photos</span>}
          </p>
        )}
      </div>
    </Link>
  );
}
