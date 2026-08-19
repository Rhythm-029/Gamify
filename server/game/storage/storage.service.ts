/**
 * Storage Service — abstracted file storage adapter.
 * Default: local disk (writes to /uploads/).
 * Swap to S3/R2 by implementing the same interface and setting STORAGE_ADAPTER env.
 */

import fs from 'fs';
import path from 'path';
import { ENV } from '../../config/env';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Upload a file to storage. Returns a URL or path to the stored file.
 * @param localPath - Absolute path to the local file
 * @param storagePath - Destination path within the storage bucket
 */
export async function uploadFile(localPath: string, storagePath: string): Promise<string> {
  if (ENV.STORAGE_ADAPTER === 's3' || ENV.STORAGE_ADAPTER === 'r2') {
    // S3/R2 adapter — swap in when cloud storage is configured
    return uploadToS3(localPath, storagePath);
  }

  // Default: local disk
  const destDir = path.join(UPLOAD_DIR, path.dirname(storagePath));
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const destPath = path.join(UPLOAD_DIR, storagePath);
  fs.copyFileSync(localPath, destPath);

  // Return a server-accessible URL
  return `/uploads/${storagePath}`;
}

/**
 * Upload a buffer (e.g. generated PDF) directly.
 */
export async function uploadBuffer(
  buffer: Buffer,
  storagePath: string,
  contentType: string = 'application/octet-stream'
): Promise<string> {
  if (ENV.STORAGE_ADAPTER === 's3' || ENV.STORAGE_ADAPTER === 'r2') {
    return uploadBufferToS3(buffer, storagePath, contentType);
  }

  const destDir = path.join(UPLOAD_DIR, path.dirname(storagePath));
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  const destPath = path.join(UPLOAD_DIR, storagePath);
  fs.writeFileSync(destPath, buffer);
  return `/uploads/${storagePath}`;
}

// ── S3/R2 adapter (stub — wire real AWS SDK when storage is provisioned) ─────

async function uploadToS3(localPath: string, storagePath: string): Promise<string> {
  // TODO: wire AWS SDK / Cloudflare R2 client here
  // Example:
  // const client = new S3Client({ region: ENV.AWS_REGION });
  // await client.send(new PutObjectCommand({ Bucket: ENV.S3_BUCKET, Key: storagePath, Body: fs.readFileSync(localPath) }));
  // return `https://${ENV.S3_BUCKET}.s3.amazonaws.com/${storagePath}`;
  throw new Error('S3/R2 adapter not yet configured. Set STORAGE_ADAPTER=local or wire the S3 client.');
}

async function uploadBufferToS3(buffer: Buffer, storagePath: string, contentType: string): Promise<string> {
  throw new Error('S3/R2 adapter not yet configured.');
}
