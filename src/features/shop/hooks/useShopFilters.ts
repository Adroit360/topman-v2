"use client";

import { useDeferredValue, useMemo, useState } from "react";
import type { BookRecord } from "@/features/catalog/types/book";
import type {
  ShopFilterOption,
  ShopFilterState,
  UseShopFiltersInput,
  UseShopFiltersResult,
} from "../types/filters";

const INITIAL_FILTERS: ShopFilterState = {
  searchTerm: "",
  selectedPublisherIds: [],
  selectedTypes: [],
  selectedLevels: [],
  showAvailableOnly: false,
};

const normalizeText = (value: string) => value.trim().toLowerCase();

const buildOptions = (
  values: string[],
  labels?: Map<string, string>,
): ShopFilterOption[] => {
  const counts = new Map<string, number>();

  for (const value of values) {
    const normalizedValue = value.trim();

    if (!normalizedValue) {
      continue;
    }

    counts.set(normalizedValue, (counts.get(normalizedValue) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([value, count]) => ({
      value,
      label: labels?.get(value) ?? value,
      count,
    }))
    .sort((left, right) => left.label.localeCompare(right.label));
};

const toggleValue = (items: string[], value: string) =>
  items.includes(value)
    ? items.filter((item) => item !== value)
    : [...items, value];

const matchesSearchTerm = (book: BookRecord, searchTerm: string) => {
  if (!searchTerm) {
    return true;
  }

  const haystack = [
    book.title,
    book.publisher.name,
    book.publisher.author,
    book.level,
    book.type,
    ...book.tags,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(searchTerm);
};

export const useShopFilters = ({
  books,
  publishers,
}: UseShopFiltersInput): UseShopFiltersResult => {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const deferredSearchTerm = useDeferredValue(filters.searchTerm);

  const publisherOptions = useMemo(
    () =>
      buildOptions(
        books.map((book) => book.publisherId),
        new Map(publishers.map((publisher) => [publisher.id, publisher.name])),
      ),
    [books, publishers],
  );

  const typeOptions = useMemo(
    () => buildOptions(books.map((book) => book.type)),
    [books],
  );

  const levelOptions = useMemo(
    () => buildOptions(books.map((book) => book.level)),
    [books],
  );

  const filteredBooks = useMemo(() => {
    const normalizedSearchTerm = normalizeText(deferredSearchTerm);

    return books.filter((book) => {
      if (
        filters.selectedPublisherIds.length > 0 &&
        !filters.selectedPublisherIds.includes(book.publisherId)
      ) {
        return false;
      }

      if (
        filters.selectedTypes.length > 0 &&
        !filters.selectedTypes.includes(book.type)
      ) {
        return false;
      }

      if (
        filters.selectedLevels.length > 0 &&
        !filters.selectedLevels.includes(book.level)
      ) {
        return false;
      }

      if (filters.showAvailableOnly && !book.isAvailable) {
        return false;
      }

      return matchesSearchTerm(book, normalizedSearchTerm);
    });
  }, [books, deferredSearchTerm, filters]);

  const activeFilterCount =
    filters.selectedPublisherIds.length +
    filters.selectedTypes.length +
    filters.selectedLevels.length +
    (filters.showAvailableOnly ? 1 : 0) +
    (filters.searchTerm.trim() ? 1 : 0);

  return {
    books,
    publishers,
    filteredBooks,
    filters,
    publisherOptions,
    typeOptions,
    levelOptions,
    activeFilterCount,
    resultCountLabel:
      filteredBooks.length === 1 ? "1 book" : `${filteredBooks.length} books`,
    setSearchTerm: (value) => {
      setFilters((currentFilters) => ({
        ...currentFilters,
        searchTerm: value,
      }));
    },
    togglePublisher: (publisherId) => {
      setFilters((currentFilters) => ({
        ...currentFilters,
        selectedPublisherIds: toggleValue(
          currentFilters.selectedPublisherIds,
          publisherId,
        ),
      }));
    },
    toggleType: (type) => {
      setFilters((currentFilters) => ({
        ...currentFilters,
        selectedTypes: toggleValue(currentFilters.selectedTypes, type),
      }));
    },
    toggleLevel: (level) => {
      setFilters((currentFilters) => ({
        ...currentFilters,
        selectedLevels: toggleValue(currentFilters.selectedLevels, level),
      }));
    },
    setShowAvailableOnly: (nextValue) => {
      setFilters((currentFilters) => ({
        ...currentFilters,
        showAvailableOnly: nextValue,
      }));
    },
    resetFilters: () => {
      setFilters(INITIAL_FILTERS);
    },
  };
};
