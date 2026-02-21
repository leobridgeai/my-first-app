import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { z } from "zod";

const CreateAlbumSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET() {
  try {
    const albums = await prisma.album.findMany({
      include: {
        _count: { select: { photos: true } },
        coverPhoto: true,
        photos: {
          include: { photo: true },
          orderBy: { photo: { sortOrder: "asc" } },
          take: 1,
        },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    return NextResponse.json(albums);
  } catch (err) {
    console.error("GET /api/albums error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    const parsed = CreateAlbumSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { name, description } = parsed.data;
    const slug = slugify(name);

    const existing = await prisma.album.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "An album with this name already exists" }, { status: 409 });
    }

    const album = await prisma.album.create({
      data: { name, slug, description },
    });

    return NextResponse.json(album, { status: 201 });
  } catch (err) {
    console.error("POST /api/albums error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
