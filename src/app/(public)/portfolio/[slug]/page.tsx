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
    <div className="max-w-7xl mx-auto px-6 py-12">
      <Link
        href="/portfolio"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors mb-8"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4"
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
        Back to Portfolio
      </Link>

      <h1 className="text-3xl md:text-4xl font-heading mb-3">{album.name}</h1>
      {album.description && (
        <p className="text-muted mb-10 max-w-lg">{album.description}</p>
      )}

      <PhotoGrid photos={photos} layout="masonry" />
    </div>
  );
}
