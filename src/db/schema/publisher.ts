import {
  mysqlTable as table,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

import { createdAt, id, updatedAt } from "./schema-helper";
import { book } from "./book";

export const publisher = table("publishers", {
  id,
  name: text().notNull(),
  reference: text().notNull(),
  author: text().notNull(),
  deletedAt: timestamp({ mode: "date" }),
});

export const publisherAuthor = table("publisher_authors", {
  id,
  publisherId: varchar({ length: 191 })
    .notNull()
    .references(() => publisher.id),
  name: text().notNull(),
  deletedAt: timestamp({ mode: "date" }),
  createdAt,
  updatedAt,
});

export const publisherRelations = relations(publisher, ({ many }) => ({
  books: many(book),
  authors: many(publisherAuthor),
}));

export const publisherAuthorRelations = relations(
  publisherAuthor,
  ({ one, many }) => ({
    publisher: one(publisher, {
      fields: [publisherAuthor.publisherId],
      references: [publisher.id],
    }),
    books: many(book),
  }),
);
