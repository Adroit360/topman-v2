"use client";

import { useMemo, useState } from "react";
import { CheckIcon, ChevronsUpDownIcon, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { PublisherSummary } from "@/features/catalog";
import { cn } from "@/lib/utils";

type PublisherOption = PublisherSummary & {
  archived?: boolean;
};

const matchesQuery = (publisher: PublisherOption, query: string) => {
  if (!query) {
    return true;
  }

  const haystack = [publisher.name, publisher.reference, publisher.author]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
};

export const PublisherSearchSelect = ({
  options,
  value,
  onChange,
  placeholder,
  ariaInvalid,
}: {
  options: PublisherOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaInvalid?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selectedPublisher = options.find((option) => option.id === value);
  const filteredOptions = useMemo(
    () =>
      options.filter((option) =>
        matchesQuery(option, query.trim().toLowerCase()),
      ),
    [options, query],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-between font-normal",
            !selectedPublisher && "text-muted-foreground",
          )}
          aria-invalid={ariaInvalid}
        >
          <span className="truncate">
            {selectedPublisher
              ? selectedPublisher.archived
                ? `${selectedPublisher.name} (current publisher)`
                : selectedPublisher.name
              : (placeholder ?? "Select publisher")}
          </span>
          <ChevronsUpDownIcon data-icon="inline-end" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-3">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search publishers"
            className="pl-9"
          />
        </div>

        <div className="max-h-60 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            <div className="flex flex-col gap-1">
              {filteredOptions.map((option) => {
                const isSelected = option.id === value;

                return (
                  <button
                    key={option.id}
                    type="button"
                    className={cn(
                      "flex w-full items-start justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground",
                      isSelected && "bg-accent text-accent-foreground",
                    )}
                    onClick={() => {
                      onChange(option.id);
                      setOpen(false);
                      setQuery("");
                    }}
                  >
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate font-medium">
                        {option.name}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {option.reference}
                        {option.author ? ` · ${option.author}` : ""}
                        {option.archived ? " · archived" : ""}
                      </span>
                    </span>
                    {isSelected ? (
                      <CheckIcon className="mt-0.5 size-4" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
              No publishers match this search.
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
