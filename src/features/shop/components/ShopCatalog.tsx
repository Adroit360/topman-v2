"use client";

import { useState } from "react";
import { CatalogProvider } from "@/features/catalog/components/CatalogProvider";
import { useCatalog } from "@/features/catalog/hooks/useCatalog";
import type { CatalogProviderProps } from "@/features/catalog/types/catalog";
import { useShopFilters } from "../hooks/useShopFilters";
import { ShopFiltersDrawer } from "./ShopFiltersDrawer";
import { ShopFiltersSidebar } from "./ShopFiltersSidebar";
import { ShopResults } from "./ShopResults";
import { ShopResultsHeader } from "./ShopResultsHeader";
import SectionBread from "@/components/misc/section-breadcrumb";

type ShopCatalogProps = Pick<CatalogProviderProps, "initialBooks" | "initialPublishers">;

const ShopCatalogContent = () => {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { books, publishers } = useCatalog();
  const shopFilters = useShopFilters({ books, publishers });

  return (
    <section className="pb-14 pt-8 sm:pb-18 sm:pt-10 lg:pb-24">
      {/* <SectionBread title="Book List" description="Browse our collection of books" bread={[]} /> */}

      <div className="-px-4 -sm:px-6 mt-20 -lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row lg:items-start">
          <ShopFiltersSidebar
            filters={shopFilters.filters}
            publisherOptions={shopFilters.publisherOptions}
            typeOptions={shopFilters.typeOptions}
            levelOptions={shopFilters.levelOptions}
            togglePublisher={shopFilters.togglePublisher}
            toggleType={shopFilters.toggleType}
            toggleLevel={shopFilters.toggleLevel}
            setShowAvailableOnly={shopFilters.setShowAvailableOnly}
            resetFilters={shopFilters.resetFilters}
          />

          <div className="flex min-w-0 px-4 md:pl-4 flex-1 flex-col gap-5">
            <ShopResultsHeader
              searchTerm={shopFilters.filters.searchTerm}
              onSearchTermChange={shopFilters.setSearchTerm}
              onOpenFilters={() => setFiltersOpen(true)}
              onResetFilters={shopFilters.resetFilters}
              resultCountLabel={shopFilters.resultCountLabel}
              activeFilterCount={shopFilters.activeFilterCount}
            />

            <ShopResults books={shopFilters.filteredBooks} onResetFilters={shopFilters.resetFilters} />
          </div>
        </div>
      </div>

      <ShopFiltersDrawer
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        filters={shopFilters.filters}
        publisherOptions={shopFilters.publisherOptions}
        typeOptions={shopFilters.typeOptions}
        levelOptions={shopFilters.levelOptions}
        togglePublisher={shopFilters.togglePublisher}
        toggleType={shopFilters.toggleType}
        toggleLevel={shopFilters.toggleLevel}
        setShowAvailableOnly={shopFilters.setShowAvailableOnly}
        resetFilters={shopFilters.resetFilters}
      />
    </section>
  );
};

export const ShopCatalog = ({ initialBooks, initialPublishers }: ShopCatalogProps) => {
  return (
    <CatalogProvider initialBooks={initialBooks} initialPublishers={initialPublishers}>
      <ShopCatalogContent />
    </CatalogProvider>
  );
};
