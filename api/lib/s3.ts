import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { nanoid } from "nanoid";

function getS3Config() {
  const bucket = process.env.S3_BUCKET_NAME;
  const region = process.env.AWS_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!bucket || !region || !accessKeyId || !secretAccessKey) {
    return null;
  }
  return { bucket, region, accessKeyId, secretAccessKey };
}

/**
 * Returns a short-lived URL the browser can PUT a video file to directly,
 * plus the final public URL it will be reachable at afterwards. Used for
 * the seller's product verification video in the approval chat.
 */
export async function createVideoUploadUrl(contentType: string) {
  const config = getS3Config();
  if (!config) {
    throw new Error(
      "Video upload isn't configured yet. Set S3_BUCKET_NAME, AWS_REGION, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY.",
    );
  }

  const client = new S3Client({
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  const key = `product-verification-videos/${nanoid()}`;
  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 300 });
  const publicUrl = `https://${config.bucket}.s3.${config.region}.amazonaws.com/${key}`;

  return { uploadUrl, publicUrl };
}
