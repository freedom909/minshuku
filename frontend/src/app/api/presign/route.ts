import { NextResponse } from "next/server";
import crypto from "crypto";
import AWS from "aws-sdk";

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  signatureVersion: "v4"
});

export async function POST(req: Request) {
  const { filename, type } = await req.json();

  const key = `myNumber/${crypto.randomUUID()}-${filename}`;

  const presignedUrl = await s3.getSignedUrlPromise("putObject", {
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Expires: 60,
    ContentType: type,
  });

  return NextResponse.json({ key, presignedUrl });
}
