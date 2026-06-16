import { and, asc, eq, isNull } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { publisher, publisherAuthor } from "@/db/schema";
import { auth } from "@/lib/auth";

export const GET = async (
  _request: Request,
  { params }: { params: Promise<{ publisherId: string }> },
) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json(
      { success: false, message: "Unauthorized." },
      { status: 401 },
    );
  }

  const { publisherId } = await params;

  const [matchedPublisher] = await db
    .select({ id: publisher.id })
    .from(publisher)
    .where(and(eq(publisher.id, publisherId), isNull(publisher.deletedAt)));

  if (!matchedPublisher) {
    return NextResponse.json(
      { success: false, message: "Publisher not found." },
      { status: 404 },
    );
  }

  const authors = await db
    .select({
      id: publisherAuthor.id,
      publisherId: publisherAuthor.publisherId,
      name: publisherAuthor.name,
    })
    .from(publisherAuthor)
    .where(
      and(
        eq(publisherAuthor.publisherId, publisherId),
        isNull(publisherAuthor.deletedAt),
      ),
    )
    .orderBy(asc(publisherAuthor.name));

  return NextResponse.json(
    {
      success: true,
      data: {
        authors,
      },
    },
    { status: 200 },
  );
};
