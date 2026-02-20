import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import CinemaViewer from "@/components/CinemaViewer";
import { SITE_URL, SITE_NAME } from "@/lib/metadata";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const album = await prisma.album.findUnique({
    where: { slug },
    include: {
      coverPhoto: true,
      photos: {
        include: { photo: true },
        orderBy: { photo: { sortOrder: "asc" } },
        take: 1,
      },
    },
  });

  if (!album) return { title: "Album Not Found" };

  const description =
    album.description || `${album.name} - photography by Leonard Canitrot`;
  const coverPhoto = album.coverPhoto || album.photos[0]?.photo;

  return {
    title: album.name,
    description,
    openGraph: {
      type: "article",
      url: `${SITE_URL}/work/${slug}`,
      siteName: SITE_NAME,
      title: `${album.name} | Leonard Canitrot`,
      description,
      ...(coverPhoto && {
        images: [
          {
            url: coverPhoto.cloudinaryUrl,
            width: coverPhoto.width,
            height: coverPhoto.height,
            alt: album.name,
          },
        ],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: `${album.name} | Leonard Canitrot`,
      description,
      ...(coverPhoto && { images: [coverPhoto.cloudinaryUrl] }),
    },
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

  return <CinemaViewer photos={photos} albumName={album.name} />;
}
