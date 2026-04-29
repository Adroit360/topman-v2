import type { Metadata } from "next";
import { getBooks, getPublishers } from "@/features/catalog";
import { BooksManagement } from "@/features/books";

export const metadata: Metadata = {
  title: "Dashboard Books",
  description: "Manage books and publisher assignments from the dashboard.",
};

export default async function BooksPage() {
  const [books, publishers] = await Promise.all([getBooks(), getPublishers()]);

  return (
    <div className="flex flex-col gap-6">
      <BooksManagement books={books} publishers={publishers} />
    </div>
  );
}
