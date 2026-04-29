import "server-only";

import { cache } from "react";
import { asc, isNull } from "drizzle-orm";
import { db } from "@/db";
import { publisher } from "@/db/schema/publisher";
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

    return publisherRows.map((publisherRow) => ({
      id: publisherRow.id,
      name: publisherRow.name,
      reference: publisherRow.reference,
      author: publisherRow.author,
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
    }));
  }
});
