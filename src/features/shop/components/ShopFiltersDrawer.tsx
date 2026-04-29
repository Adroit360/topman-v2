"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { UseShopFiltersResult } from "../types/filters";
import { ShopFilterControls } from "./ShopFilterControls";

type ShopFiltersDrawerProps = Pick<
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
> & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const ShopFiltersDrawer = ({
  open,
  onOpenChange,
  filters,
  publisherOptions,
  typeOptions,
  levelOptions,
  togglePublisher,
  toggleType,
  toggleLevel,
  setShowAvailableOnly,
  resetFilters,
}: ShopFiltersDrawerProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-0 left-auto right-0 h-svh w-[min(24rem,100vw)] max-w-[24rem] translate-x-0 translate-y-0 rounded-none rounded-l-[2rem] p-5 sm:max-w-[24rem] data-open:slide-in-from-right-full data-closed:slide-out-to-right-full">
        <DialogHeader>
          <DialogTitle>Filter books</DialogTitle>
          <DialogDescription>
            Refine the shop by publisher, type, level, and stock.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
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
      </DialogContent>
    </Dialog>
  );
};
