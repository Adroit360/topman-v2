"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ShopFilterOption, ShopFilterState } from "../types/filters";

type ShopFilterControlsProps = {
  filters: ShopFilterState;
  publisherOptions: ShopFilterOption[];
  typeOptions: ShopFilterOption[];
  levelOptions: ShopFilterOption[];
  onTogglePublisher: (publisherId: string) => void;
  onToggleType: (type: string) => void;
  onToggleLevel: (level: string) => void;
  onShowAvailableOnlyChange: (nextValue: boolean) => void;
  onReset: () => void;
};

type FilterSectionProps = {
  title: string;
  options: ShopFilterOption[];
  selectedValues: string[];
  onToggle: (value: string) => void;
};

const checkboxClassName = "size-4 rounded border border-orange-300 !bg-white accent-orange-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50";

const FilterSection = ({ title, options, selectedValues, onToggle }: FilterSectionProps) => {
  if (options.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold tracking-[-0.02em] text-foreground ">{title}</h3>
        <Badge variant="secondary">{options.length}</Badge>
      </div>

      <div className="flex max-h-60 flex-col gap-2 overflow-y-auto pr-1">
        {options.map((option) => {
          const isSelected = selectedValues.includes(option.value);

          return (
            <label key={option.value} className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl -border -border-border bg-background px-3 py-2 text-sm transition-colors hover:bg-muted/50 data-[state=checked]:border-primary">
              <span className="flex items-center gap-3">
                <input type="checkbox" checked={isSelected} onChange={() => onToggle(option.value)} className={checkboxClassName} />
                <span className="text-foreground">{option.label}</span>
              </span>
              <span className="text-xs text-muted-foreground">{option.count}</span>
            </label>
          );
        })}
      </div>
    </section>
  );
};

export const ShopFilterControls = ({ filters, publisherOptions, typeOptions, levelOptions, onTogglePublisher, onToggleType, onToggleLevel, onShowAvailableOnlyChange, onReset }: ShopFilterControlsProps) => {
  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">Browse filters</p>
          <h2 className="mt-1 text-lg font-semibold tracking-[-0.03em] text-foreground">Narrow the shelf</h2>
        </div>

        <Button variant="ghost" size="sm" onClick={onReset}>
          Reset
        </Button>
      </div>

      <FilterSection title="Publishers" options={publisherOptions} selectedValues={filters.selectedPublisherIds} onToggle={onTogglePublisher} />

      <FilterSection title="Type" options={typeOptions} selectedValues={filters.selectedTypes} onToggle={onToggleType} />

      <FilterSection title="Level" options={levelOptions} selectedValues={filters.selectedLevels} onToggle={onToggleLevel} />
    </div>
  );
};
