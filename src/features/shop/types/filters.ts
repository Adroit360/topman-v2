import type { BookRecord } from "@/features/catalog/types/book";
import type { PublisherSummary } from "@/features/catalog/types/publisher";

export type ShopFilterState = {
  searchTerm: string;
  selectedPublisherIds: string[];
  selectedTypes: string[];
  selectedLevels: string[];
  selectedTags: string[];
  showAvailableOnly: boolean;
};

export type ShopFilterOption = {
  value: string;
  label: string;
  count: number;
};

export type UseShopFiltersInput = {
  books: BookRecord[];
  publishers: PublisherSummary[];
  initialFilters?: Partial<ShopFilterState>;
};

export type UseShopFiltersResult = {
  books: BookRecord[];
  publishers: PublisherSummary[];
  filteredBooks: BookRecord[];
  filters: ShopFilterState;
  publisherOptions: ShopFilterOption[];
  typeOptions: ShopFilterOption[];
  levelOptions: ShopFilterOption[];
  tagOptions: ShopFilterOption[];
  activeFilterCount: number;
  resultCountLabel: string;
  setSearchTerm: (value: string) => void;
  togglePublisher: (publisherId: string) => void;
  toggleType: (type: string) => void;
  toggleLevel: (level: string) => void;
  toggleTag: (tag: string) => void;
  setShowAvailableOnly: (nextValue: boolean) => void;
  resetFilters: () => void;
};
