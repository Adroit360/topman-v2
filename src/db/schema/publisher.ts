import { mysqlTable as table, text, timestamp } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

import { id } from "./schema-helper";
import { book } from "./book";

export const publisher = table("publishers", {
  id,
  name: text().notNull(),
  reference: text().notNull(),
  author: text().notNull(),
  deletedAt: timestamp({ mode: "date" }),
});

export const publisherRelations = relations(publisher, ({ many }) => ({
  books: many(book),
}));
