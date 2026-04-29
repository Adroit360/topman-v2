import { z } from "zod";
import { contactSchema } from "../schema/contact-schema";
import type { ContactSubmissionSelect } from "@/db/schema/contact";

export type ContactFormValues = z.infer<typeof contactSchema>;

export type ContactFieldName = keyof ContactFormValues;

export const contactFieldNames: ContactFieldName[] = [
  "name",
  "email",
  "phone",
  "subject",
  "message",
];

export type ContactResult = {
  success: boolean;
  message: string;
  fieldErrors?: Partial<Record<ContactFieldName, string>>;
};

export const initialContactResult: ContactResult = {
  success: false,
  message: "",
};

export type ContactRecord = ContactSubmissionSelect;

export const contactStatusValues = ["new", "read", "replied"] as const;

export type ContactStatus = (typeof contactStatusValues)[number];

export const contactStatusLabelMap: Record<ContactStatus, string> = {
  new: "New",
  read: "Read",
  replied: "Replied",
};
