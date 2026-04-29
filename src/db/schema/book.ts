import {
  int,
  mysqlTable as table,
  text,
  timestamp,
  varchar,
  boolean,
  json,
} from "drizzle-orm/mysql-core";
import { createdAt, id, updatedAt } from "./schema-helper";
import { publisher } from "./publisher";
import { relations } from "drizzle-orm/relations";

export const book = table("books", {
  id,
  title: text().notNull(),
  level: text().notNull(),
  type: text().notNull(),
  image: text(),
  isAvailable: boolean().notNull().default(true),
  price: int().notNull(),
  tags: json("tags").notNull().default([]),
  publisherId: varchar({ length: 191 })
    .notNull()
    .references(() => publisher.id),
  deletedAt: timestamp({ mode: "date" }),
  createdAt,
  updatedAt,
});

export const bookRelations = relations(book, ({ one }) => ({
  publisher: one(publisher, {
    fields: [book.publisherId],
    references: [publisher.id],
  }),
}));
