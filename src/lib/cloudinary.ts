import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

export function getCloudinaryUrl(
  publicId: string,
  options: { width?: number; height?: number; quality?: string; crop?: string } = {}
) {
  const { width, height, quality = "auto", crop = "fill" } = options;
  const transforms: string[] = [`q_${quality}`, "f_auto"];

  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (crop) transforms.push(`c_${crop}`);

  return cloudinary.url(publicId, {
    transformation: [
      {
        quality,
        fetch_format: "auto",
        ...(width && { width }),
        ...(height && { height }),
        ...(crop && { crop }),
      },
    ],
  });
}
