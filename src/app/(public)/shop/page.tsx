import { getCatalog } from "@/features/catalog/services/getCatalog";
import { ShopCatalog } from "@/features/shop/components/ShopCatalog";

export default async function Page() {
  const catalog = await getCatalog();

  return (
    <ShopCatalog
      initialBooks={catalog.books}
      initialPublishers={catalog.publishers}
    />
  );
}
