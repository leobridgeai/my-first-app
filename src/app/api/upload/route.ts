import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import cloudinary from "@/lib/cloudinary";


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

export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  const hasCloudinary =
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET;

  if (!hasCloudinary) {
    return NextResponse.json(
      {
        error:
          "Cloudinary is not configured. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.",
      },
      { status: 500 }
    );
  }

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

      const cloudResult = await uploadToCloudinary(buffer);
      const uploaded = {
        publicId: cloudResult.public_id,
        url: cloudResult.secure_url,
        width: cloudResult.width,
        height: cloudResult.height,
      };

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
