import "server-only";

import { cache } from "react";
import { and, asc, inArray, isNull } from "drizzle-orm";
import { db } from "@/db";
import { publisher, publisherAuthor } from "@/db/schema/publisher";
import type { PublisherSummary } from "../types/publisher";

export const getPublishers = cache(async (): Promise<PublisherSummary[]> => {
  try {
    const publisherRows = await db
      .select({
        id: publisher.id,
        name: publisher.name,
        reference: publisher.reference,
        author: publisher.author,
      })
      .from(publisher)
      .where(isNull(publisher.deletedAt))
      .orderBy(asc(publisher.name));

    const publisherIds = publisherRows.map((publisherRow) => publisherRow.id);
    const authorRows =
      publisherIds.length > 0
        ? await db
            .select({
              id: publisherAuthor.id,
              publisherId: publisherAuthor.publisherId,
              name: publisherAuthor.name,
            })
            .from(publisherAuthor)
            .where(
              and(
                inArray(publisherAuthor.publisherId, publisherIds),
                isNull(publisherAuthor.deletedAt),
              ),
            )
            .orderBy(asc(publisherAuthor.name))
        : [];

    const authorsByPublisherId = new Map<
      string,
      PublisherSummary["authors"]
    >();

    for (const authorRow of authorRows) {
      const authors = authorsByPublisherId.get(authorRow.publisherId) ?? [];
      authors.push(authorRow);
      authorsByPublisherId.set(authorRow.publisherId, authors);
    }

    return publisherRows.map((publisherRow) => ({
      id: publisherRow.id,
      name: publisherRow.name,
      reference: publisherRow.reference,
      author: publisherRow.author,
      authors: authorsByPublisherId.get(publisherRow.id) ?? [
        {
          id: publisherRow.id,
          publisherId: publisherRow.id,
          name: publisherRow.author,
        },
      ],
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : "";

    const normalizedMessage = message.toLowerCase();

    if (
      !normalizedMessage.includes("author") &&
      !normalizedMessage.includes("deletedat")
    ) {
      throw error;
    }

    const publisherRows = await db
      .select({
        id: publisher.id,
        name: publisher.name,
        reference: publisher.reference,
      })
      .from(publisher)
      .orderBy(asc(publisher.name));

    return publisherRows.map((publisherRow) => ({
      id: publisherRow.id,
      name: publisherRow.name,
      reference: publisherRow.reference,
      author: "Unknown",
      authors: [
        {
          id: publisherRow.id,
          publisherId: publisherRow.id,
          name: "Unknown",
        },
      ],
    }));
  }
});
