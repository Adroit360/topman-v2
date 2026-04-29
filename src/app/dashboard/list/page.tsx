import type { Metadata } from "next";
import {
  getListOrders,
  ListOrdersManagement,
} from "@/features/upload-book-list";

export const metadata: Metadata = {
  title: "Dashboard Book List Orders",
  description:
    "Review uploaded book lists, update status, and keep admin timeline notes.",
};

export default async function ListOrdersPage() {
  const orders = await getListOrders();

  return <ListOrdersManagement orders={orders} />;
}
