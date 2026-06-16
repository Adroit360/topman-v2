import { z } from "zod/v4";
import type { PublisherSummary } from "@/features/catalog";

export const publisherFieldNames = [
  "name",
  "reference",
  "authors",
] as const;

const publisherTextField = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(191, `${label} must be 191 characters or less.`);

export const publisherFormSchema = z.object({
  name: publisherTextField("Publisher name"),
  reference: publisherTextField("Reference"),
  authors: z
    .array(publisherTextField("Author"))
    .min(1, "Add at least one author.")
    .superRefine((authors, context) => {
      const seenAuthors = new Set<string>();

      authors.forEach((author, index) => {
        const key = author.toLowerCase();

        if (seenAuthors.has(key)) {
          context.addIssue({
            code: "custom",
            message: "Each author for this publisher must be unique.",
            path: [index],
          });
        }

        seenAuthors.add(key);
      });
    }),
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
