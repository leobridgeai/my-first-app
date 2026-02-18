import { prisma } from "@/lib/db";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Work | Raw Street Portraits",
};

export default async function WorkPage() {
  const albums = await prisma.album.findMany({
    include: {
      _count: { select: { photos: true } },
      coverPhoto: true,
      photos: {
        include: { photo: true },
        orderBy: { photo: { sortOrder: "asc" } },
        take: 1,
      },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return (
    <div className="pt-16">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-12 md:py-20">
        {/* Header */}
        <div className="mb-12 md:mb-16">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold tracking-[-0.02em] uppercase leading-[0.85]">
            Work
          </h1>
          <div className="harsh-divider w-16 md:w-24 mt-6" />
        </div>

        {albums.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-white/30 text-sm tracking-[0.2em] uppercase">
              No work yet.
            </p>
          </div>
        ) : (
          <div className="work-grid">
            {albums.map((album, index) => {
              const coverPhoto = album.coverPhoto || album.photos[0]?.photo;
              // Determine tile size class based on position for editorial layout
              const sizeClass = getTileSize(index, albums.length);

              return (
                <Link
                  key={album.id}
                  href={`/work/${album.slug}`}
                  className={`group block relative animate-slide-up ${sizeClass}`}
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="relative w-full h-full overflow-hidden bg-surface">
                    {coverPhoto ? (
                      <Image
                        src={coverPhoto.cloudinaryUrl}
                        alt={album.name}
                        fill
                        className="object-cover photo-harsh transition-transform duration-700 group-hover:scale-[1.03]"
                        sizes={
                          sizeClass.includes("span-2")
                            ? "(max-width: 768px) 100vw, 66vw"
                            : "(max-width: 768px) 100vw, 33vw"
                        }
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-12 h-12 text-white/10"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={0.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                          />
                        </svg>
                      </div>
                    )}

                    {/* Gradient overlay - always visible, stronger on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent group-hover:from-black/80 transition-all duration-500" />

                    {/* Subtle hover brightening */}
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-all duration-500" />

                    {/* Title - always visible, overlaid at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                      <h2 className="text-white text-lg md:text-xl font-heading font-bold tracking-wide uppercase leading-tight">
                        {album.name}
                      </h2>
                      <p className="text-white/40 text-[10px] mt-1.5 tracking-[0.25em] uppercase">
                        {album._count.photos}{" "}
                        {album._count.photos === 1 ? "image" : "images"}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Returns a CSS class that determines the tile size in the editorial grid.
 * Creates a varied, magazine-style layout:
 * - First album is always large (spans 2 columns)
 * - Then alternates between standard and featured sizes
 */
function getTileSize(index: number, total: number): string {
  if (total === 1) return "work-tile-hero";
  if (total === 2) return "work-tile-half";

  // First item is always the hero / large tile
  if (index === 0) return "work-tile-hero";

  // Create a repeating pattern: after the hero, cycle through
  // [standard, standard, wide, standard, standard, wide, ...]
  const pos = (index - 1) % 4;
  if (pos === 2) return "work-tile-wide";

  return "work-tile-standard";
}
