/**
 * Upload a file directly to Cloudinary from the browser.
 * Uses a server-signed token so the API secret stays safe.
 * Bypasses Vercel's 4.5 MB serverless body-size limit.
 */
export async function uploadToCloudinary(file: File): Promise<{
  publicId: string;
  url: string;
  width: number;
  height: number;
}> {
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
