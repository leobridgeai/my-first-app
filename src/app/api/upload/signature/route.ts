import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { v2 as cloudinary } from "cloudinary";

export async function POST() {
  const authError = await requireAuth();
  if (authError) return authError;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      { error: "Cloudinary is not configured." },
      { status: 500 }
    );
  }

  const timestamp = Math.round(Date.now() / 1000);
  const params = { folder: "portfolio", timestamp };
  const signature = cloudinary.utils.api_sign_request(params, apiSecret);

  return NextResponse.json({
    signature,
    timestamp,
    cloudName,
    apiKey,
    folder: "portfolio",
  });
}
