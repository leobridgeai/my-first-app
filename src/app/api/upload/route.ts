import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import cloudinary from "@/lib/cloudinary";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";


function uploadToCloudinary(
  buffer: Buffer
): Promise<{
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
}> {
  return new Promise((resolve, reject) => {
    // 8-second timeout — if Cloudinary is unreachable, fail fast
    const timeout = setTimeout(() => {
      reject(new Error("Cloudinary upload timed out"));
    }, 8000);

    cloudinary.uploader
      .upload_stream(
        { folder: "portfolio", resource_type: "image" },
        (error, result) => {
          clearTimeout(timeout);
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
}

function saveLocally(buffer: Buffer, originalName: string) {
  return (async () => {
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const ext = path.extname(originalName) || ".jpg";
    const filename = `${randomUUID()}${ext}`;
    const filePath = path.join(uploadsDir, filename);
    await writeFile(filePath, buffer);

    return {
      publicId: `local/${filename}`,
      url: `/uploads/${filename}`,
      width: 0,
      height: 0,
    };
  })();
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files.length) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    const results = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      let uploaded: {
        publicId: string;
        url: string;
        width: number;
        height: number;
      };

      try {
        const cloudResult = await uploadToCloudinary(buffer);
        uploaded = {
          publicId: cloudResult.public_id,
          url: cloudResult.secure_url,
          width: cloudResult.width,
          height: cloudResult.height,
        };
      } catch {
        // Cloudinary unavailable — save locally
        uploaded = await saveLocally(buffer, file.name);
      }

      results.push({
        ...uploaded,
        originalName: file.name,
      });
    }

    return NextResponse.json(results);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown upload error";
    console.error("Upload error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
