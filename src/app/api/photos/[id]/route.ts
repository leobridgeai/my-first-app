import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import cloudinary from "@/lib/cloudinary";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth();
  if (authError) return authError;

  const { id } = await params;
  const body = await request.json();
  const { title, description, sortOrder, isFeatured, albumIds } = body;

  if (albumIds !== undefined) {
    await prisma.photoAlbum.deleteMany({ where: { photoId: id } });
    if (albumIds.length > 0) {
      await prisma.photoAlbum.createMany({
        data: albumIds.map((albumId: string) => ({ photoId: id, albumId })),
      });
    }
  }

  const photo = await prisma.photo.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(sortOrder !== undefined && { sortOrder }),
      ...(isFeatured !== undefined && { isFeatured }),
    },
    include: {
      albums: { include: { album: true } },
    },
  });

  return NextResponse.json(photo);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth();
  if (authError) return authError;

  const { id } = await params;

  const photo = await prisma.photo.findUnique({ where: { id } });
  if (!photo) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }

  try {
    await cloudinary.uploader.destroy(photo.cloudinaryPublicId);
  } catch {
    // Continue even if Cloudinary delete fails
  }

  await prisma.photo.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
