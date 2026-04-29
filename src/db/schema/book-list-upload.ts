import {
  int,
  json,
  mysqlTable as table,
  text,
  varchar,
} from "drizzle-orm/mysql-core";
import { createdAt, id, updatedAt } from "./schema-helper";

export const bookListUpload = table("book_list_uploads", {
  id,
  name: varchar({ length: 255 }).notNull(),
  phone: varchar({ length: 20 }).notNull(),
  location: varchar({ length: 255 }).notNull(),
  fileName: varchar({ length: 255 }).notNull(),
  blobName: text().notNull(),
  blobUrl: text().notNull(),
  contentType: varchar({ length: 100 }).notNull(),
  fileSize: int().notNull(),
  status: varchar({ length: 32 }).notNull().default("submitted"),
  notes: json("notes").notNull().default([]),
  createdAt,
  updatedAt,
});

export type BookListUploadInsert = typeof bookListUpload.$inferInsert;
export type BookListUploadSelect = typeof bookListUpload.$inferSelect;
