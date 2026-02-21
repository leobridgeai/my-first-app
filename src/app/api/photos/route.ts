import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { z } from "zod";

const CreatePhotoSchema = z.object({
  title: z.string().max(500).optional(),
  description: z.string().max(2000).optional(),
  cloudinaryPublicId: z.string().min(1),
  cloudinaryUrl: z.string().url(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  albumIds: z.array(z.string().uuid()).optional(),
  isFeatured: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
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
  } catch (err) {
    console.error("GET /api/photos error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    const parsed = CreatePhotoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { title, description, cloudinaryPublicId, cloudinaryUrl, width, height, albumIds, isFeatured } = parsed.data;

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
  } catch (err) {
    console.error("POST /api/photos error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
