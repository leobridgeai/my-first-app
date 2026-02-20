/**
 * Upload a file directly to Cloudinary from the browser.
 * Uses a server-signed token so the API secret stays safe.
 * Bypasses Vercel's 4.5 MB serverless body-size limit.
 *
 * Images are automatically compressed on the client side before
 * uploading to stay within Cloudinary's 10 MB free-tier limit.
 */

/**
 * Compress and resize an image on the client side using Canvas.
 * Keeps images under a target size to avoid 413 errors from Cloudinary.
 */
async function compressImage(
  file: File,
  maxDimension = 2048,
  quality = 0.82
): Promise<File> {
  // Skip compression for files under 500KB or non-image types
  if (file.size < 500 * 1024) return file;
  if (!file.type.startsWith("image/")) return file;

  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);

      let { width, height } = img;

      // Scale down if either dimension exceeds the max
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round(height * (maxDimension / width));
          width = maxDimension;
        } else {
          width = Math.round(width * (maxDimension / height));
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file); // fallback to original
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file); // fallback to original
            return;
          }
          // Use .jpg extension to match the JPEG output
          const name = file.name.replace(/\.[^/.]+$/, ".jpg");
          resolve(new File([blob], name, { type: "image/jpeg" }));
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = () => {
      resolve(file); // fallback to original on error
    };

    img.src = URL.createObjectURL(file);
  });
}

export async function uploadToCloudinary(rawFile: File): Promise<{
  publicId: string;
  url: string;
  width: number;
  height: number;
}> {
  // Compress before uploading to stay within Cloudinary limits
  const file = await compressImage(rawFile);

  // 1. Get a signed upload token from our API
  const sigRes = await fetch("/api/upload/signature", { method: "POST" });
  if (!sigRes.ok) {
    const text = await sigRes.text();
    let msg = `Signature request failed (${sigRes.status})`;
    try {
      const json = JSON.parse(text);
      if (json.error) msg = json.error;
    } catch {
      if (text) msg = text;
    }
    throw new Error(msg);
  }

  const { signature, timestamp, cloudName, apiKey, folder } =
    await sigRes.json();

  // 2. Upload directly to Cloudinary
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("folder", folder);

  const cloudRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!cloudRes.ok) {
    const text = await cloudRes.text();
    let msg = `Cloudinary upload failed (${cloudRes.status})`;
    try {
      const json = JSON.parse(text);
      if (json.error?.message) msg = json.error.message;
    } catch {
      if (text) msg = text;
    }
    throw new Error(msg);
  }

  const data = await cloudRes.json();
  return {
    publicId: data.public_id,
    url: data.secure_url,
    width: data.width,
    height: data.height,
  };
}
