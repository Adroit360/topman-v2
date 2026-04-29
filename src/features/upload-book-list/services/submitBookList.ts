"use server";

import { db } from "@/db";
import { bookListUpload } from "@/db/schema/book-list-upload";
import {
  SubmitBookListResult,
  uploadBookListFieldNames,
  uploadBookListServerSchema,
} from "../types/upload";
import { uploadBookListFileToBlob } from "./uploadToBlob";

const toFieldErrors = (error: unknown): SubmitBookListResult["fieldErrors"] => {
  const fieldErrors: Partial<
    Record<(typeof uploadBookListFieldNames)[number], string>
  > = {};

  if (!(error instanceof Error) || !("issues" in error)) {
    return fieldErrors;
  }

  const issues = (
    error as { issues?: Array<{ path?: Array<string>; message: string }> }
  ).issues;

  if (!issues) {
    return fieldErrors;
  }

  for (const issue of issues) {
    const fieldName = issue.path?.[0];

    if (
      fieldName &&
      uploadBookListFieldNames.includes(
        fieldName as (typeof uploadBookListFieldNames)[number],
      )
    ) {
      fieldErrors[fieldName as (typeof uploadBookListFieldNames)[number]] =
        issue.message;
    }
  }

  return fieldErrors;
};

export const submitBookList = async (
  formData: FormData,
): Promise<SubmitBookListResult> => {
  const parsed = uploadBookListServerSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    location: formData.get("location"),
    file: formData.get("file"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Fix the highlighted fields and try again.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  try {
    const { name, phone, location, file } = parsed.data;
    const upload = await uploadBookListFileToBlob(file);
    const uploadId = crypto.randomUUID();

    await db.insert(bookListUpload).values({
      id: uploadId,
      name,
      phone,
      location,
      fileName: file.name,
      blobName: upload.blobName,
      blobUrl: upload.blobUrl,
      contentType: file.type || "application/octet-stream",
      fileSize: file.size,
      status: "submitted",
    });

    return {
      success: true,
      message: "Your book list has been uploaded successfully.",
      data: {
        uploadId,
        blobUrl: upload.blobUrl,
        fileName: file.name,
      },
    };
  } catch {
    return {
      success: false,
      message:
        "We could not upload your book list right now. Please try again.",
    };
  }
};
