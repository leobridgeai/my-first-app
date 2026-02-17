"use client";

import { useState, useMemo } from "react";
import PhotoGrid from "@/components/PhotoGrid";

interface AlbumBasic {
  id: string;
  name: string;
  slug: string;
}

interface AlbumWithCount extends AlbumBasic {
  _count: { photos: number };
}

interface Photo {
  id: string;
  title: string | null;
  description: string | null;
  cloudinaryUrl: string;
  width: number;
  height: number;
  albums: { album: AlbumBasic }[];
}

interface PortfolioClientProps {
  photos: Photo[];
  albums: AlbumWithCount[];
}

export default function PortfolioClient({
  photos,
  albums,
}: PortfolioClientProps) {
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);

  const filteredPhotos = useMemo(() => {
    if (!selectedAlbum) return photos;
    return photos.filter((photo) =>
      photo.albums.some((pa) => pa.album.slug === selectedAlbum)
    );
  }, [photos, selectedAlbum]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl md:text-4xl font-heading mb-3">Portfolio</h1>
      <p className="text-muted mb-10 max-w-lg">
        Browse through my collection of portrait photography.
      </p>

      {/* Album filters */}
      {albums.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-10">
          <button
            onClick={() => setSelectedAlbum(null)}
            className={`px-4 py-2 text-xs tracking-widest uppercase transition-all duration-200 border ${
              !selectedAlbum
                ? "bg-foreground text-white border-foreground"
                : "bg-transparent text-muted border-gray-200 hover:border-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          {albums.map((album) => (
            <button
              key={album.id}
              onClick={() => setSelectedAlbum(album.slug)}
              className={`px-4 py-2 text-xs tracking-widest uppercase transition-all duration-200 border ${
                selectedAlbum === album.slug
                  ? "bg-foreground text-white border-foreground"
                  : "bg-transparent text-muted border-gray-200 hover:border-foreground hover:text-foreground"
              }`}
            >
              {album.name}
              <span className="ml-1 opacity-50">{album._count.photos}</span>
            </button>
          ))}
        </div>
      )}

      <PhotoGrid photos={filteredPhotos} layout="masonry" />
    </div>
  );
}
