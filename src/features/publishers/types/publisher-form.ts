import z from "zod";
import type { PublisherSummary } from "@/features/catalog";

export const publisherFieldNames = ["name", "reference", "author"] as const;

const publisherTextField = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(191, `${label} must be 191 characters or less.`);

export const publisherFormSchema = z.object({
  name: publisherTextField("Publisher name"),
  reference: publisherTextField("Reference"),
  author: publisherTextField("Author"),
});

export const createPublisherSchema = publisherFormSchema;

export const updatePublisherSchema = publisherFormSchema.extend({
  id: z.string().trim().min(1, "Publisher id is required."),
});

export const deletePublisherSchema = z.object({
  id: z.string().trim().min(1, "Publisher id is required."),
});

export type PublisherFormValues = z.input<typeof publisherFormSchema>;

type PublisherActionFieldErrors = Partial<
  Record<(typeof publisherFieldNames)[number], string>
>;

export type PublisherActionResult = {
  success: boolean;
  message: string;
  fieldErrors?: PublisherActionFieldErrors;
  data?: {
    publisher: PublisherSummary;
  };
};

export type DeletePublisherResult = {
  success: boolean;
  message: string;
};
