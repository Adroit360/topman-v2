"use server";

import "server-only";

import { BlobServiceClient } from "@azure/storage-blob";
import { createId } from "@paralleldrive/cuid2";
import { z } from "zod";
import { env } from "../../../../data/env";

const uploadBookCoverAcceptedFileTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

const uploadBookCoverMaxFileSize = 10 * 1024 * 1024;

const fileTypeSet = new Set(uploadBookCoverAcceptedFileTypes);

const uploadBookCoverSchema = z.object({
  file: z
    .instanceof(File, {
      message: "Select a JPG, PNG, or WEBP image to upload.",
    })
    .refine(
      (file) =>
        fileTypeSet.has(
          file.type as (typeof uploadBookCoverAcceptedFileTypes)[number],
        ),
      "Upload a JPG, PNG, or WEBP image.",
    )
    .refine(
      (file) => file.size <= uploadBookCoverMaxFileSize,
      "Image size must be 10 MB or less.",
    ),
});

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

type UploadBookCoverResult = {
  success: boolean;
  message: string;
  fieldErrors?: {
    file?: string;
  };
  data?: {
    blobName: string;
    blobUrl: string;
    fileName: string;
  };
};

export const uploadBookCover = async (
  formData: FormData,
): Promise<UploadBookCoverResult> => {
  const parsed = uploadBookCoverSchema.safeParse({
    file: formData.get("file"),
  });

  if (!parsed.success) {
    const fileError = parsed.error.flatten().fieldErrors.file?.[0];

    return {
      success: false,
      message: fileError ?? "Select a valid cover image and try again.",
      fieldErrors: {
        file: fileError,
      },
    };
  }

  try {
    const { file } = parsed.data;
    const containerClient = blobServiceClient.getContainerClient(
      env.AZURE_STORAGE_CONTAINER_BOOKS,
    );

    await containerClient.createIfNotExists();

    const safeName = sanitizeFileName(file.name) || "book-cover";
    const now = new Date();
    const blobName = [
      "book-covers",
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
      success: true,
      message: "Cover image uploaded.",
      data: {
        blobName,
        blobUrl: blobClient.url,
        fileName: file.name,
      },
    };
  } catch {
    return {
      success: false,
      message: "We could not upload this cover right now. Please try again.",
    };
  }
};
