import "server-only";

import { desc } from "drizzle-orm";
import { db } from "@/db";
import { contactSubmission } from "@/db/schema/contact";
import type { ContactRecord } from "../types";

export const getContactSubmissions = async (): Promise<ContactRecord[]> => {
  const rows = await db
    .select()
    .from(contactSubmission)
    .orderBy(desc(contactSubmission.createdAt));

  return rows;
};
