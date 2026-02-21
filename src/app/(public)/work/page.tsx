import { prisma } from "@/lib/db";
import Link from "next/link";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary-url";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Work",
  description:
    "Photography collections by Leonard Canitrot. Raw, confrontational street portraits.",
};

/*
 * Data-driven catalog: albums and quotes in a single ordered sequence.
 * Each entry is either { type: "project", album } or { type: "quote", text, attribution? }.
 */

interface QuoteEntry {
  type: "quote";
  text: string;
  attribution?: string;
}

interface ProjectEntry {
  type: "project";
  album: {
    id: string;
    name: string;
    slug: string;
    coverPhoto: { cloudinaryUrl: string; width: number; height: number } | null;
    photos: { photo: { cloudinaryUrl: string; width: number; height: number } }[];
  };
}

type CatalogEntry = QuoteEntry | ProjectEntry;

const quotes: QuoteEntry[] = [
  {
    type: "quote",
    text: "I have a deep psychological need to get close to people. It\u2019s the only way I can see them.",
  },
  {
    type: "quote",
    text: "The photograph is not what was photographed. It is something else. It is a new fact.",
    attribution: "Garry Winogrand",
  },
  {
    type: "quote",
    text: "If you can smell the street by looking at the photo, it\u2019s a street photograph.",
  },
];

export default async function WorkPage() {
  const albums = await prisma.album.findMany({
    include: {
      _count: { select: { photos: true } },
      coverPhoto: true,
      photos: {
        include: { photo: true },
        orderBy: { photo: { sortOrder: "asc" } },
        take: 3,
      },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  if (albums.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-[#999] text-sm tracking-[0.15em] uppercase">
          No work yet.
        </p>
      </div>
    );
  }

  // Build interleaved catalog: projects with quotes inserted between groups
  const catalog: CatalogEntry[] = [];
  const groupSize = Math.max(2, Math.ceil(albums.length / (quotes.length + 1)));

  albums.forEach((album, i) => {
    // Insert a quote before certain groups (not before the first)
    if (i > 0 && i % groupSize === 0) {
      const qIdx = Math.floor(i / groupSize) - 1;
      if (qIdx < quotes.length) {
        catalog.push(quotes[qIdx]);
      }
    }
    catalog.push({ type: "project", album });
  });

  // Add any remaining quotes at the end
  const usedQuotes = Math.max(0, Math.floor((albums.length - 1) / groupSize));
  if (usedQuotes < quotes.length) {
    catalog.push(quotes[Math.min(usedQuotes, quotes.length - 1)]);
  }

  // Gather up to 3 images for the hero strip from the first few albums
  const heroImages: { url: string; width: number; height: number }[] = [];
  for (const album of albums) {
    if (heroImages.length >= 3) break;
    const cover = album.coverPhoto || album.photos[0]?.photo;
    if (cover) {
      heroImages.push({
        url: optimizeCloudinaryUrl(cover.cloudinaryUrl, { width: 600 }),
        width: cover.width,
        height: cover.height,
      });
    }
  }

  return (
    <div className="min-h-screen bg-white pt-[56px]">
      {/* Hero image strip — static, minimal */}
      {heroImages.length > 0 && (
        <div className="max-w-[960px] mx-auto px-6 md:px-10 pt-10 pb-6">
          <div className="flex gap-3 overflow-hidden" style={{ maxHeight: 280 }}>
            {heroImages.map((img, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={img.url}
                alt=""
                className="object-cover flex-1 min-w-0"
                style={{ maxHeight: 280 }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Catalog — single column, generous spacing */}
      <div className="max-w-[960px] mx-auto px-6 md:px-10 pb-24">
        {catalog.map((entry, i) => {
          if (entry.type === "quote") {
            return (
              <div key={`q-${i}`} className="py-14 md:py-20">
                <p className="text-[13px] md:text-[14px] leading-relaxed text-[#666] max-w-[520px] italic">
                  {entry.text}
                </p>
                {entry.attribution && (
                  <p className="text-[11px] text-[#999] mt-2 tracking-[0.1em]">
                    — {entry.attribution}
                  </p>
                )}
              </div>
            );
          }

          const album = entry.album;
          return (
            <div key={album.id} className="py-4 md:py-5">
              <Link
                href={`/work/${album.slug}`}
                className="text-[14px] md:text-[15px] tracking-[0.12em] uppercase text-[#222] hover:text-[#888]"
              >
                {album.name}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
