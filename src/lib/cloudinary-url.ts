/**
 * Transform a raw Cloudinary URL to add delivery optimizations.
 * Works on both client and server (no SDK dependency).
 *
 * Cloudinary URL format:
 *   https://res.cloudinary.com/{cloud}/image/upload/v123/folder/file.jpg
 *
 * Transformed:
 *   https://res.cloudinary.com/{cloud}/image/upload/f_auto,q_auto,w_800/v123/folder/file.jpg
 *
 * This saves bandwidth (biggest free-plan cost) by:
 *  - f_auto: serves WebP/AVIF when the browser supports it
 *  - q_auto: automatic quality reduction with no visible loss
 *  - w_/h_: resize so the CDN serves appropriately sized images
 *  - c_limit: never upscale, only downscale
 */

interface OptimizeOptions {
  /** Max width in pixels */
  width?: number;
  /** Max height in pixels */
  height?: number;
  /** Crop mode: "limit" (default, no upscale), "fill" (crop to exact size) */
  crop?: "limit" | "fill";
  /** Quality: "auto" (default), "auto:low", "auto:eco", "auto:good", "auto:best" */
  quality?: string;
  /** Enable progressive loading — blurry→sharp (default true) */
  progressive?: boolean;
}

export function optimizeCloudinaryUrl(
  url: string,
  options: OptimizeOptions = {}
): string {
  if (!url || !url.includes("res.cloudinary.com")) return url;

  const { width, height, crop = "limit", quality = "auto", progressive = true } = options;

  const transforms: string[] = [`f_auto`, `q_${quality}`];
  if (progressive) transforms.push("fl_progressive:semi");
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (width || height) transforms.push(`c_${crop}`);

  const segment = transforms.join(",");

  // Insert transforms after /upload/ (before version or public ID)
  return url.replace("/image/upload/", `/image/upload/${segment}/`);
}
