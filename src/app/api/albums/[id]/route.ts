import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const album = await prisma.album.findUnique({
    where: { id },
    include: {
      coverPhoto: true,
      photos: {
        include: { photo: true },
        orderBy: { photo: { sortOrder: "asc" } },
      },
    },
  });

  if (!album) {
    return NextResponse.json({ error: "Album not found" }, { status: 404 });
  }

  return NextResponse.json(album);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth();
  if (authError) return authError;

  const { id } = await params;
  const body = await request.json();
  const { name, description, sortOrder, coverPhotoId } = body;

  const album = await prisma.album.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(sortOrder !== undefined && { sortOrder }),
      ...(coverPhotoId !== undefined && { coverPhotoId }),
    },
  });

  return NextResponse.json(album);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth();
  if (authError) return authError;

  const { id } = await params;

  await prisma.album.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
