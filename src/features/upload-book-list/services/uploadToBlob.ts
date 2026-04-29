import "server-only";

import { createId } from "@paralleldrive/cuid2";
import { BlobServiceClient } from "@azure/storage-blob";
import { env } from "../../../../data/env";

const blobServiceClient = BlobServiceClient.fromConnectionString(
  env.AZURE_CONNECTION_STRING,
);

const sanitizeFileName = (fileName: string) => {
  return fileName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

export const uploadBookListFileToBlob = async (file: File) => {
  const containerClient = blobServiceClient.getContainerClient(
    env.AZURE_STORAGE_CONTAINER_LIST,
  );

  await containerClient.createIfNotExists();

  const safeName = sanitizeFileName(file.name) || "book-list-upload";
  const now = new Date();
  const blobName = [
    "book-lists",
    String(now.getUTCFullYear()),
    String(now.getUTCMonth() + 1).padStart(2, "0"),
    `${createId()}-${safeName}`,
  ].join("/");

  const blobClient = containerClient.getBlockBlobClient(blobName);

  await blobClient.uploadData(Buffer.from(await file.arrayBuffer()), {
    blobHTTPHeaders: {
      blobContentType: file.type || "application/octet-stream",
    },
  });

  return {
    blobName,
    blobUrl: blobClient.url,
  };
};
