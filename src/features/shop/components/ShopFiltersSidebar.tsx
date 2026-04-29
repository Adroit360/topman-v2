"use client";

import type { UseShopFiltersResult } from "../types/filters";
import { ShopFilterControls } from "./ShopFilterControls";

type ShopFiltersSidebarProps = Pick<
  UseShopFiltersResult,
  | "filters"
  | "publisherOptions"
  | "typeOptions"
  | "levelOptions"
  | "togglePublisher"
  | "toggleType"
  | "toggleLevel"
  | "setShowAvailableOnly"
  | "resetFilters"
>;

export const ShopFiltersSidebar = ({
  filters,
  publisherOptions,
  typeOptions,
  levelOptions,
  togglePublisher,
  toggleType,
  toggleLevel,
  setShowAvailableOnly,
  resetFilters,
}: ShopFiltersSidebarProps) => {
  return (
    <aside className="hidden w-full max-w-xs shrink-0 lg:block">
      <div className="sticky top-24 rounded-[2rem] border border-border bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-background)_94%,transparent)_0%,color-mix(in_oklab,var(--color-muted)_26%,transparent)_100%)] p-5 shadow-sm">
        <ShopFilterControls
          filters={filters}
          publisherOptions={publisherOptions}
          typeOptions={typeOptions}
          levelOptions={levelOptions}
          onTogglePublisher={togglePublisher}
          onToggleType={toggleType}
          onToggleLevel={toggleLevel}
          onShowAvailableOnlyChange={setShowAvailableOnly}
          onReset={resetFilters}
        />
      </div>
    </aside>
  );
};
