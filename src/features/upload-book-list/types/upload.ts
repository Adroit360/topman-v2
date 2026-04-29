import { z } from "zod/v4";

export const uploadBookListAcceptedFileTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const uploadBookListMaxFileSize = 10 * 1024 * 1024;

export const uploadBookListFieldNames = [
  "name",
  "phone",
  "location",
  "file",
] as const;

export type UploadBookListFieldName = (typeof uploadBookListFieldNames)[number];

const fileTypeSet = new Set(uploadBookListAcceptedFileTypes);

const hasSupportedFileType = (file: File | null) => {
  if (!file) {
    return false;
  }

  return fileTypeSet.has(
    file.type as (typeof uploadBookListAcceptedFileTypes)[number],
  );
};

export const uploadBookListClientSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(255),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number.")
    .max(20, "Phone number is too long."),
  location: z.string().trim().min(2, "Enter your location.").max(255),
  file: z
    .custom<FileList>((value) => value instanceof FileList, {
      message: "Select a PDF or image to upload.",
    })
    .refine((value) => value.length > 0, "Select a PDF or image to upload.")
    .refine(
      (value) => hasSupportedFileType(value.item(0)),
      "Upload a PDF, JPG, PNG, or WEBP file.",
    )
    .refine((value) => {
      const file = value.item(0);

      return !!file && file.size <= uploadBookListMaxFileSize;
    }, "File size must be 10 MB or less."),
});

export const uploadBookListServerSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(255),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number.")
    .max(20, "Phone number is too long."),
  location: z.string().trim().min(2, "Enter your location.").max(255),
  file: z
    .instanceof(File, {
      message: "Select a PDF or image to upload.",
    })
    .refine(
      (file) => hasSupportedFileType(file),
      "Upload a PDF, JPG, PNG, or WEBP file.",
    )
    .refine(
      (file) => file.size <= uploadBookListMaxFileSize,
      "File size must be 10 MB or less.",
    ),
});

export type UploadBookListFormValues = z.infer<
  typeof uploadBookListClientSchema
>;

export type SubmitBookListResult = {
  success: boolean;
  message: string;
  fieldErrors?: Partial<Record<UploadBookListFieldName, string>>;
  data?: {
    uploadId: string;
    blobUrl: string;
    fileName: string;
  };
};

export const initialSubmitBookListResult: SubmitBookListResult = {
  success: false,
  message: "",
};
