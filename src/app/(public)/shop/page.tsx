import { getCatalog } from "@/features/catalog/services/getCatalog";
import { ShopCatalog } from "@/features/shop/components/ShopCatalog";

type ShopPageProps = {
  searchParams?: Promise<{
    publisher?: string | string[];
    type?: string | string[];
    level?: string | string[];
    tag?: string | string[];
    q?: string | string[];
  }>;
};

const toArray = (value: string | string[] | undefined) => {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
};

export default async function Page({ searchParams }: ShopPageProps) {
  const catalog = await getCatalog();
  const params = searchParams ? await searchParams : undefined;

  return (
    <ShopCatalog
      initialBooks={catalog.books}
      initialPublishers={catalog.publishers}
      initialFilters={{
        searchTerm: toArray(params?.q)[0] ?? "",
        selectedPublisherIds: toArray(params?.publisher),
        selectedTypes: toArray(params?.type),
        selectedLevels: toArray(params?.level),
        selectedTags: toArray(params?.tag),
      }}
    />
  );
}
