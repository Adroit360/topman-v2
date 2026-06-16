import "server-only";

import { cache } from "react";
import { asc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { book } from "@/db/schema/book";
import { publisher, publisherAuthor } from "@/db/schema/publisher";
import type { BookRecord } from "../types/book";

const toBookTags = (tags: unknown): string[] => {
  if (!Array.isArray(tags)) {
    return [];
  }

  return tags.map((tag) => String(tag ?? "").trim()).filter(Boolean);
};

export const getBooks = cache(async (): Promise<BookRecord[]> => {
  try {
    const bookRows = await db
      .select({
        id: book.id,
        title: book.title,
        level: book.level,
        type: book.type,
        image: book.image,
        isAvailable: book.isAvailable,
        price: book.price,
        tags: book.tags,
        publisherId: book.publisherId,
        authorId: book.authorId,
        publisherName: publisher.name,
        publisherReference: publisher.reference,
        publisherAuthor: publisher.author,
        authorName: publisherAuthor.name,
      })
      .from(book)
      .innerJoin(publisher, eq(book.publisherId, publisher.id))
      .leftJoin(publisherAuthor, eq(book.authorId, publisherAuthor.id))
      .where(isNull(book.deletedAt))
      .orderBy(asc(book.title));

    return bookRows.map((bookRow) => ({
      id: bookRow.id,
      title: bookRow.title,
      level: bookRow.level,
      type: bookRow.type,
      image: bookRow.image,
      isAvailable: bookRow.isAvailable,
      price: bookRow.price,
      tags: toBookTags(bookRow.tags),
      publisherId: bookRow.publisherId,
      authorId: bookRow.authorId,
      author: bookRow.authorId
        ? {
            id: bookRow.authorId,
            name: bookRow.authorName ?? bookRow.publisherAuthor,
          }
        : null,
      publisher: {
        id: bookRow.publisherId,
        name: bookRow.publisherName,
        reference: bookRow.publisherReference,
        author: bookRow.publisherAuthor,
        authors: bookRow.authorId
          ? [
              {
                id: bookRow.authorId,
                publisherId: bookRow.publisherId,
                name: bookRow.authorName ?? bookRow.publisherAuthor,
              },
            ]
          : [
              {
                id: bookRow.publisherId,
                publisherId: bookRow.publisherId,
                name: bookRow.publisherAuthor,
              },
            ],
      },
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : "";

    if (
      !message.includes("deletedat") &&
      !message.includes("authorid") &&
      !message.includes("publisher_authors")
    ) {
      throw error;
    }

    const bookRows = await db
      .select({
        id: book.id,
        title: book.title,
        level: book.level,
        type: book.type,
        image: book.image,
        isAvailable: book.isAvailable,
        price: book.price,
        tags: book.tags,
        publisherId: book.publisherId,
        publisherName: publisher.name,
        publisherReference: publisher.reference,
        publisherAuthor: publisher.author,
      })
      .from(book)
      .innerJoin(publisher, eq(book.publisherId, publisher.id))
      .orderBy(asc(book.title));

    return bookRows.map((bookRow) => ({
      id: bookRow.id,
      title: bookRow.title,
      level: bookRow.level,
      type: bookRow.type,
      image: bookRow.image,
      isAvailable: bookRow.isAvailable,
      price: bookRow.price,
      tags: toBookTags(bookRow.tags),
      publisherId: bookRow.publisherId,
      authorId: null,
      author: null,
      publisher: {
        id: bookRow.publisherId,
        name: bookRow.publisherName,
        reference: bookRow.publisherReference,
        author: bookRow.publisherAuthor,
        authors: [
          {
            id: bookRow.publisherId,
            publisherId: bookRow.publisherId,
            name: bookRow.publisherAuthor,
          },
        ],
      },
    }));
  }
});
