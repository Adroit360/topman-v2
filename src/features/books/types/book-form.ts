import z from "zod";
import { buildBookTags } from "@/lib/book-tags";
import {
  isSourceBookLevel,
  isSourceBookType,
  sourceBookLevelOptions,
  sourceBookTypeOptions,
} from "@/lib/book-taxonomy";

export const bookLevelOptions = sourceBookLevelOptions;

export const bookTypeOptions = sourceBookTypeOptions;

export const bookFieldNames = [
  "title",
  "level",
  "type",
  "price",
  "publisherId",
  "isAvailable",
  "imageUrl",
] as const;

const bookTextField = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(255, `${label} must be 255 characters or less.`);

const taxonomyField = (
  label: "Level" | "Type",
  predicate: (value: string) => boolean,
) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .refine(predicate, `Choose a valid ${label.toLowerCase()}.`);

export const bookFormSchema = z.object({
  title: bookTextField("Title"),
  level: taxonomyField("Level", isSourceBookLevel),
  type: taxonomyField("Type", isSourceBookType),
  price: z.number().int().min(0, "Price must be zero or more."),
  publisherId: z.string().trim().min(1, "Publisher is required."),
  isAvailable: z.boolean(),
  imageUrl: z.string().nullable().optional(),
});

export const createBookSchema = bookFormSchema;

export const updateBookSchema = bookFormSchema.extend({
  id: z.string().trim().min(1, "Book id is required."),
});

export const deleteBookSchema = z.object({
  id: z.string().trim().min(1, "Book id is required."),
});

export type BookFormValues = z.input<typeof bookFormSchema>;

type BookActionFieldErrors = Partial<
  Record<(typeof bookFieldNames)[number], string>
>;

export type BookActionResult = {
  success: boolean;
  message: string;
  fieldErrors?: BookActionFieldErrors;
  data?: {
    id: string;
  };
};

export type DeleteBookResult = {
  success: boolean;
  message: string;
};

export const toBookTags = (
  title: string,
  publisherName: string,
  level: string,
  type: string,
) => buildBookTags(title, publisherName, level, type);

export const toBookInsertValues = (
  values: {
    title: string;
    level: string;
    type: string;
    price: number;
    publisherId: string;
    isAvailable: boolean;
    imageUrl?: string | null;
  },
  publisherName: string,
) => ({
  title: values.title,
  level: values.level,
  type: values.type,
  image: values.imageUrl ?? null,
  price: values.price,
  tags: toBookTags(values.title, publisherName, values.level, values.type),
  publisherId: values.publisherId,
  isAvailable: values.isAvailable,
});
