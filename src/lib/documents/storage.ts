import fs from "fs/promises";
import path from "path";
import { ApiError } from "@/lib/api-response";

type StoredFile = {
  storagePath: string;
  url: string;
};

function getStorageDriver() {
  return (process.env.UPLOAD_STORAGE_DRIVER || (process.env.NODE_ENV === "production" ? "supabase" : "local")).toLowerCase();
}

function getSupabaseConfig() {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const apiKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "documents";

  if (!baseUrl || !apiKey) {
    throw new ApiError(
      "Supabase Storage is not configured. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY/SUPABASE_SERVICE_ROLE_KEY.",
      500,
    );
  }

  return { baseUrl, apiKey, bucket };
}

function encodeObjectPath(objectPath: string) {
  return objectPath.split("/").map(encodeURIComponent).join("/");
}

export async function storeDocumentFile(
  userId: string,
  fileName: string,
  contentType: string,
  buffer: Buffer,
): Promise<StoredFile> {
  const driver = getStorageDriver();

  if (driver === "local") {
    if (process.env.NODE_ENV === "production") {
      throw new ApiError("Local upload storage cannot be used in production. Set UPLOAD_STORAGE_DRIVER=supabase.", 500);
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });
    const storagePath = path.join(uploadDir, fileName);
    await fs.writeFile(storagePath, buffer);
    return { storagePath, url: `/uploads/${fileName}` };
  }

  if (driver !== "supabase") {
    throw new ApiError(`Unsupported upload storage driver: ${driver}`, 500);
  }

  const { baseUrl, apiKey, bucket } = getSupabaseConfig();
  const objectPath = `${userId}/${fileName}`;
  const encodedBucket = encodeURIComponent(bucket);
  const encodedPath = encodeObjectPath(objectPath);
  const response = await fetch(`${baseUrl}/storage/v1/object/${encodedBucket}/${encodedPath}`, {
    method: "POST",
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": contentType || "application/octet-stream",
      "x-upsert": "false",
    },
    body: new Uint8Array(buffer),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new ApiError(`Failed to store document in Supabase Storage (${response.status}).`, 502, details.slice(0, 500));
  }

  return {
    storagePath: `${bucket}/${objectPath}`,
    url: `${baseUrl}/storage/v1/object/authenticated/${encodedBucket}/${encodedPath}`,
  };
}
