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
    title: `${album.name} | Portrait Photography`,
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
    <div className="pt-20">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-16 md:py-24">
        <Link
          href="/work"
          className="inline-flex items-center gap-1.5 text-[11px] tracking-[0.25em] uppercase text-muted hover:text-white transition-colors mb-12"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Work
        </Link>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading tracking-tight mb-3">
          {album.name}
        </h1>
        {album.description && (
          <p className="text-muted mb-12 max-w-lg text-[15px]">
            {album.description}
          </p>
        )}

        <PhotoGrid photos={photos} layout="masonry" />
      </div>
    </div>
  );
}
