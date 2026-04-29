import { mysqlTable as table, text, varchar } from "drizzle-orm/mysql-core";
import { createdAt, id, updatedAt } from "./schema-helper";

export const contactSubmission = table("contact_submissions", {
  id,
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull(),
  phone: varchar({ length: 20 }),
  subject: varchar({ length: 255 }).notNull(),
  message: text().notNull(),
  status: varchar({ length: 32 }).notNull().default("new"),
  createdAt,
  updatedAt,
});

export type ContactSubmissionInsert = typeof contactSubmission.$inferInsert;
export type ContactSubmissionSelect = typeof contactSubmission.$inferSelect;
