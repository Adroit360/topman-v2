"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ShopResultsHeaderProps = {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  onOpenFilters: () => void;
  onResetFilters: () => void;
  resultCountLabel: string;
  activeFilterCount: number;
};

export const ShopResultsHeader = ({
  searchTerm,
  onSearchTermChange,
  onOpenFilters,
  onResetFilters,
  resultCountLabel,
  activeFilterCount,
}: ShopResultsHeaderProps) => {
  return (
    <div className="flex flex-col gap-4 rounded-[2rem] border border-border bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-background)_94%,transparent)_0%,color-mix(in_oklab,var(--color-muted)_22%,transparent)_100%)] p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase">
            Shop catalog
          </p>
          <h1 className="text-3xl font-semibold tracking-[-0.05em] text-foreground sm:text-4xl">
            Find the right book faster.
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            Search by keyword and refine the shelf by publisher, type, and
            level.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start lg:hidden">
          <Button variant="outline" size="sm" onClick={onOpenFilters}>
            <SlidersHorizontal data-icon="inline-start" />
            Filters
          </Button>
          {activeFilterCount > 0 ? <Badge>{activeFilterCount}</Badge> : null}
        </div>
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="relative w-full xl:max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
            placeholder="Search by title, publisher, author, type, level, or tag"
            className="h-11 rounded-full border-border bg-background pl-9 pr-10"
          />
          {searchTerm ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full"
              onClick={() => onSearchTermChange("")}
            >
              <X />
              <span className="sr-only">Clear search</span>
            </Button>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="success" className="rounded-md px-3 py-1 h-10">
            {resultCountLabel}
          </Badge>
          {activeFilterCount > 0 ? (
            <Badge variant="warning" className="rounded-md px-3 py-1 h-10">
              {activeFilterCount} active
            </Badge>
          ) : null}
          {activeFilterCount > 0 ? (
            <Button variant="ghost" size="sm" onClick={onResetFilters}>
              Clear all
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
