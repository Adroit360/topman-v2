import { getPublishers } from "@/features/catalog";
import { PublishersManagement } from "@/features/publishers";

export default async function PublishersPage() {
  const publishers = await getPublishers();

  return (
    <div className="flex flex-col gap-6">
      <PublishersManagement publishers={publishers} />
    </div>
  );
}
