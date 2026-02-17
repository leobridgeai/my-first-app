import { prisma } from "@/lib/db";
import PortfolioClient from "./PortfolioClient";

export const metadata = {
  title: "Portfolio | Portrait Photography",
};

export default async function PortfolioPage() {
  const [photos, albums] = await Promise.all([
    prisma.photo.findMany({
      include: {
        albums: { include: { album: true } },
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }),
    prisma.album.findMany({
      include: { _count: { select: { photos: true } } },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
  ]);

  return <PortfolioClient photos={photos} albums={albums} />;
}
