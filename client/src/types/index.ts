export type Source = 'arxiv' | 'medrxiv' | 'biorxiv' | 'pmc';

export interface SearchFilters {
  sources: Source[];
  dateFilter: 'any' | 'last_30_days' | 'last_6_months' | 'last_year' | '2025' | '2024';
  sortBy: 'relevance' | 'date_newest' | 'date_oldest' | 'citations';
}

export interface SearchState {
  query: string;
  filters: SearchFilters;
  page: number;
  isLoading: boolean;
  error: string | null;
  shouldSearch: boolean; // Flag to indicate when search should be performed
  accumulatedResults: any[]; // Store accumulated search results
}
