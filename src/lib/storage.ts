// File storage abstraction (Phase 2). Cloudflare R2 via S3-compatible API.
// No Supabase Storage. Local dev uses R2 dev bucket; nothing is uploaded
// during the Phase 0–2 demo (forms accept an image URL field instead).
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function r2() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
    },
  });
}

export async function presignedUploadUrl(key: string, contentType: string) {
  const url = await getSignedUrl(
    r2(),
    new PutObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key, ContentType: contentType }),
    { expiresIn: 300 }
  );
  const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;
  return { uploadUrl: url, publicUrl };
}
