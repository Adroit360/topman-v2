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
  selectedTags: [],
  showAvailableOnly: false,
};

const normalizeText = (value: string) => value.trim().toLowerCase();

const normalizeFilterValues = (values: string[] | undefined) => values?.map(normalizeText).filter(Boolean) ?? [];

const buildInitialFilters = (initialFilters?: Partial<ShopFilterState>): ShopFilterState => ({
  searchTerm: initialFilters?.searchTerm ?? INITIAL_FILTERS.searchTerm,
  selectedPublisherIds: normalizeFilterValues(initialFilters?.selectedPublisherIds),
  selectedTypes: normalizeFilterValues(initialFilters?.selectedTypes),
  selectedLevels: normalizeFilterValues(initialFilters?.selectedLevels),
  selectedTags: normalizeFilterValues(initialFilters?.selectedTags),
  showAvailableOnly: initialFilters?.showAvailableOnly ?? INITIAL_FILTERS.showAvailableOnly,
});

const canonicalTypeLabels = new Map<string, string>([
  ["activity book", "Activity Book"],
  ["handbook", "Handbook"],
  ["literature", "Literature"],
  ["practical book", "Practical Book"],
  ["practice book", "Practice Book"],
  ["sensoral practice", "Sensoral Practice"],
  ["textbook", "Textbook"],
  ["workbook", "Workbook"],
  ["writing book", "Writing Book"],
]);

const canonicalLevelLabels = new Map<string, string>([
  ["all", "All"],
  ["colleges", "Colleges"],
  ["junior high schools", "Junior High Schools"],
  ["preschool", "Preschool"],
  ["primary", "Primary"],
  ["senior high school", "Senior High School"],
]);

const buildNormalizedOptions = (
  values: string[],
  getLabel?: (value: string) => string,
): ShopFilterOption[] => {
  const counts = new Map<string, number>();
  const labels = new Map<string, string>();

  for (const value of values) {
    const normalizedValue = value.trim();
    const normalizedKey = normalizeText(normalizedValue);

    if (!normalizedKey) {
      continue;
    }

    counts.set(normalizedKey, (counts.get(normalizedKey) ?? 0) + 1);

    if (!labels.has(normalizedKey)) {
      labels.set(normalizedKey, getLabel?.(normalizedValue) ?? normalizedValue);
    }
  }

  return [...counts.entries()]
    .map(([value, count]) => ({
      value,
      label: labels.get(value) ?? value,
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
  initialFilters,
}: UseShopFiltersInput): UseShopFiltersResult => {
  const [filters, setFilters] = useState(() => buildInitialFilters(initialFilters));
  const deferredSearchTerm = useDeferredValue(filters.searchTerm);

  const publisherOptions = useMemo(
    () =>
      buildNormalizedOptions(
        books.map((book) => book.publisher.name),
      ),
    [books],
  );

  const typeOptions = useMemo(
    () =>
      buildNormalizedOptions(
        books.map((book) => book.type),
        (value) => canonicalTypeLabels.get(normalizeText(value)) ?? value,
      ),
    [books],
  );

  const levelOptions = useMemo(
    () =>
      buildNormalizedOptions(
        books.map((book) => book.level),
        (value) => canonicalLevelLabels.get(normalizeText(value)) ?? value,
      ),
    [books],
  );

  const tagOptions = useMemo(
    () => buildNormalizedOptions(books.flatMap((book) => book.tags)),
    [books],
  );

  const filteredBooks = useMemo(() => {
    const normalizedSearchTerm = normalizeText(deferredSearchTerm);

    return books.filter((book) => {
      if (
        filters.selectedPublisherIds.length > 0 &&
        !filters.selectedPublisherIds.includes(normalizeText(book.publisher.name))
      ) {
        return false;
      }

      if (
        filters.selectedTypes.length > 0 &&
        !filters.selectedTypes.includes(normalizeText(book.type))
      ) {
        return false;
      }

      if (
        filters.selectedLevels.length > 0 &&
        !filters.selectedLevels.includes(normalizeText(book.level))
      ) {
        return false;
      }

      if (
        filters.selectedTags.length > 0 &&
        !book.tags.some((tag) => filters.selectedTags.includes(normalizeText(tag)))
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
    filters.selectedTags.length +
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
    tagOptions,
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
    toggleTag: (tag) => {
      setFilters((currentFilters) => ({
        ...currentFilters,
        selectedTags: toggleValue(currentFilters.selectedTags, tag),
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
