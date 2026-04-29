import { z } from "zod";

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(255),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address.")
    .max(255),
  phone: z.string().trim().max(20).optional(),
  subject: z
    .string()
    .trim()
    .min(3, "Subject must be at least 3 characters.")
    .max(255),
  message: z.string().trim().min(10, "Message must be at least 10 characters."),
});
