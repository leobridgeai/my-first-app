import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import cloudinary from "@/lib/cloudinary";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import sizeOf from "image-size";

export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files.length) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const results = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Try Cloudinary first, fall back to local storage
      try {
        const result = await new Promise<{
          public_id: string;
          secure_url: string;
          width: number;
          height: number;
        }>((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                folder: "portfolio",
                resource_type: "image",
              },
              (error, result) => {
                if (error) reject(error);
                else
                  resolve(
                    result as {
                      public_id: string;
                      secure_url: string;
                      width: number;
                      height: number;
                    }
                  );
              }
            )
            .end(buffer);
        });

        results.push({
          publicId: result.public_id,
          url: result.secure_url,
          width: result.width,
          height: result.height,
          originalName: file.name,
        });
      } catch {
        // Cloudinary failed — save locally
        const uploadsDir = path.join(process.cwd(), "public", "uploads");
        await mkdir(uploadsDir, { recursive: true });

        const ext = path.extname(file.name) || ".jpg";
        const filename = `${randomUUID()}${ext}`;
        const filePath = path.join(uploadsDir, filename);
        await writeFile(filePath, buffer);

        let width = 0;
        let height = 0;
        try {
          const dimensions = sizeOf(buffer);
          width = dimensions.width ?? 0;
          height = dimensions.height ?? 0;
        } catch {
          // ignore dimension detection errors
        }

        results.push({
          publicId: `local/${filename}`,
          url: `/uploads/${filename}`,
          width,
          height,
          originalName: file.name,
        });
      }
    }

    return NextResponse.json(results);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown upload error";
    console.error("Upload error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
