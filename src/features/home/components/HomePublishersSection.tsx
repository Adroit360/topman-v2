import { CatalogProvider } from "@/features/catalog/components/CatalogProvider";
import type { CatalogData } from "@/features/catalog/types/catalog";
import { PublisherSection } from "./PublisherSection";

type HomePublishersSectionProps = {
  catalogPromise: Promise<CatalogData>;
};

export const HomePublishersSection = async ({
  catalogPromise,
}: HomePublishersSectionProps) => {
  const catalog = await catalogPromise;

  return (
    <CatalogProvider
      initialBooks={catalog.books}
      initialPublishers={catalog.publishers}
    >
      <PublisherSection />
    </CatalogProvider>
  );
};
