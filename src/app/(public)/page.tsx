import { prisma } from "@/lib/db";
import HomeClient from "./HomeClient";

export default async function HomePage() {
  const featuredPhotos = await prisma.photo.findMany({
    where: { isFeatured: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take: 10,
  });

  const recentPhotos = await prisma.photo.findMany({
    orderBy: { createdAt: "desc" },
    take: 9,
  });

  return <HomeClient featuredPhotos={featuredPhotos} recentPhotos={recentPhotos} />;
}
