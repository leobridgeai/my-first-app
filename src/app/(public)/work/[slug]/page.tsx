import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import CinemaViewer from "@/components/CinemaViewer";

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

  if (photos.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-white/20 text-sm tracking-[0.2em] uppercase">
          No photographs yet.
        </p>
      </div>
    );
  }

  return <CinemaViewer photos={photos} />;
}
