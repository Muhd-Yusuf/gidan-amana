import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadPhoto(
  base64Data: string,
  folder = "gidan-amana/members"
): Promise<string> {
  const result = await cloudinary.uploader.upload(base64Data, {
    folder,
    transformation: [{ width: 300, height: 300, crop: "fill", gravity: "face" }],
  });
  return result.secure_url;
}

export default cloudinary;
