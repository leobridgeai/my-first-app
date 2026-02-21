import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { z } from "zod";

const ReorderSchema = z.object({
  orderedIds: z.array(z.string().uuid()),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const { id: albumId } = await params;
    const body = await request.json();
    const parsed = ReorderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { orderedIds } = parsed.data;

    // Verify album exists
    const album = await prisma.album.findUnique({ where: { id: albumId } });
    if (!album) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 });
    }

    await prisma.$transaction(
      orderedIds.map((photoId, index) =>
        prisma.photo.update({
          where: { id: photoId },
          data: { sortOrder: index },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PUT /api/albums/[id]/photos/reorder error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
