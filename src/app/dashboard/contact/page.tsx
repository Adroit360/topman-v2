import type { Metadata } from "next";
import {
  ContactSubmissionsManagement,
  getContactSubmissions,
} from "@/features/contact";

export const metadata: Metadata = {
  title: "Dashboard Contact Submissions",
  description: "Review messages submitted via the public contact form.",
};

export default async function ContactSubmissionsPage() {
  const submissions = await getContactSubmissions();

  return <ContactSubmissionsManagement submissions={submissions} />;
}
