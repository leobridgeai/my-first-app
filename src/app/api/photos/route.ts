import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const albumSlug = searchParams.get("album");
  const featured = searchParams.get("featured");

  const where: Record<string, unknown> = {};

  if (albumSlug) {
    where.albums = {
      some: {
        album: { slug: albumSlug },
      },
    };
  }

  if (featured === "true") {
    where.isFeatured = true;
  }

  const photos = await prisma.photo.findMany({
    where,
    include: {
      albums: {
        include: { album: true },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(photos);
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  const body = await request.json();
  const { title, description, cloudinaryPublicId, cloudinaryUrl, width, height, albumIds, isFeatured } = body;

  const photo = await prisma.photo.create({
    data: {
      title,
      description,
      cloudinaryPublicId,
      cloudinaryUrl,
      width,
      height,
      isFeatured: isFeatured || false,
      albums: albumIds?.length
        ? {
            create: albumIds.map((albumId: string) => ({
              albumId,
            })),
          }
        : undefined,
    },
    include: {
      albums: { include: { album: true } },
    },
  });

  return NextResponse.json(photo, { status: 201 });
}
