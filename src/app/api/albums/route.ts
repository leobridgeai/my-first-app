import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET() {
  const albums = await prisma.album.findMany({
    include: {
      _count: { select: { photos: true } },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return NextResponse.json(albums);
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  const body = await request.json();
  const { name, description } = body;

  const slug = slugify(name);

  const existing = await prisma.album.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "An album with this name already exists" }, { status: 409 });
  }

  const album = await prisma.album.create({
    data: { name, slug, description },
  });

  return NextResponse.json(album, { status: 201 });
}
