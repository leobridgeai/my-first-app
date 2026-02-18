import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import PhotoGrid from "@/components/PhotoGrid";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const album = await prisma.album.findUnique({ where: { slug } });

  if (!album) return { title: "Album Not Found" };

  return {
    title: `${album.name} | Raw Street Portraits`,
    description: album.description || `${album.name} photo album`,
  };
}

export default async function AlbumPage({ params }: Props) {
  const { slug } = await params;

  const album = await prisma.album.findUnique({
    where: { slug },
    include: {
      photos: {
        include: { photo: true },
        orderBy: { photo: { sortOrder: "asc" } },
      },
    },
  });

  if (!album) notFound();

  const photos = album.photos.map((pa) => pa.photo);

  return (
    <div className="pt-16">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-16 md:py-24">
        <Link
          href="/work"
          className="inline-flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-white/30 hover:text-white transition-colors mb-16 font-medium"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-3 h-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </Link>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold tracking-[-0.02em] uppercase leading-[0.85] mb-4">
          {album.name}
        </h1>
        {album.description && (
          <p className="text-white/40 mb-6 max-w-lg text-[15px]">
            {album.description}
          </p>
        )}
        <div className="harsh-divider w-16 md:w-24 mb-12" />

        <PhotoGrid photos={photos} layout="masonry" />
      </div>
    </div>
  );
}
