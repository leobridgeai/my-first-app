import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; photoId: string }> }
) {
  const authError = await requireAuth();
  if (authError) return authError;

  const { id, photoId } = await params;

  await prisma.photoAlbum.delete({
    where: {
      photoId_albumId: { photoId, albumId: id },
    },
  });

  // Clear cover photo if the removed photo was the cover
  const album = await prisma.album.findUnique({ where: { id } });
  if (album?.coverPhotoId === photoId) {
    await prisma.album.update({
      where: { id },
      data: { coverPhotoId: null },
    });
  }

  return NextResponse.json({ success: true });
}
