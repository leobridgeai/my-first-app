import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import cloudinary from "@/lib/cloudinary";
import { z } from "zod";

const UpdatePhotoSchema = z.object({
  title: z.string().max(500).optional(),
  description: z.string().max(2000).optional(),
  sortOrder: z.number().int().optional(),
  isFeatured: z.boolean().optional(),
  albumIds: z.array(z.string().uuid()).optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = UpdatePhotoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { title, description, sortOrder, isFeatured, albumIds } = parsed.data;

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
  } catch (err) {
    console.error("PATCH /api/photos/[id] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
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
  } catch (err) {
    console.error("DELETE /api/photos/[id] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
