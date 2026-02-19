import { prisma } from "@/lib/db";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const heroSetting = await prisma.siteSetting.findUnique({
    where: { key: "heroImageUrl" },
  });

  const heroPublicIdSetting = await prisma.siteSetting.findUnique({
    where: { key: "heroImagePublicId" },
  });

  return (
    <HomeClient
      heroImageUrl={heroSetting?.value || null}
      heroPublicId={heroPublicIdSetting?.value || null}
    />
  );
}
