import { useQuery, useQueryClient } from "@tanstack/react-query";
import { searchPapers } from "@/lib/api";
import { PaperCard } from "./paper-card";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import type { SearchState } from "@/types";
import type { SearchResponse } from "@shared/schema";
import { useEffect } from "react";

interface SearchResultsProps {
  searchState: SearchState;
  setSearchState: (state: SearchState | ((prev: SearchState) => SearchState)) => void;
}

export function SearchResults({ searchState, setSearchState }: SearchResultsProps) {
  const queryClient = useQueryClient();
  
  const searchParams = {
    query: searchState.query,
    sources: searchState.filters.sources,
    dateFilter: searchState.filters.dateFilter,
    sortBy: searchState.filters.sortBy,
    page: searchState.page,
    limit: 20
  };

  const { data, isLoading, error, refetch } = useQuery<SearchResponse>({
    queryKey: ['search', searchParams],
    queryFn: () => searchPapers(searchParams),
    enabled: !!searchState.query && searchState.query.trim().length > 0 && searchState.shouldSearch,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update loading state and accumulate results
  useEffect(() => {
    if (data && !isLoading) {
      setSearchState(prev => ({ 
        ...prev, 
        isLoading,
        error: error ? (error instanceof Error ? error.message : 'Search failed') : null,
        shouldSearch: false, // Reset the search flag after search is triggered
        accumulatedResults: prev.page === 1 ? data.papers : [...prev.accumulatedResults, ...data.papers]
      }));
    } else {
      setSearchState(prev => ({ 
        ...prev, 
        isLoading,
        error: error ? (error instanceof Error ? error.message : 'Search failed') : null,
        shouldSearch: false // Reset the search flag after search is triggered
      }));
    }
  }, [isLoading, error, setSearchState, data]);

  if (!searchState.query) {
    return null;
  }

  // Show "Ready to Search" only if we haven't searched yet
  if (!searchState.shouldSearch && searchState.accumulatedResults.length === 0 && !data) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <h3 className="text-gray-900 font-medium mb-2">Ready to Search</h3>
          <p className="text-gray-600">
            Enter your search query and press Enter or click Search to find papers.
          </p>
        </div>
      </section>
    );
  }

  // Show loading state while searching
  if (searchState.isLoading && !data) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
            <span className="text-gray-600">Searching...</span>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-800 font-medium mb-2">Search Error</h3>
          <p className="text-red-600">{searchState.error}</p>
          <Button 
            onClick={() => refetch()}
            className="mt-4"
            variant="outline"
            data-testid="button-retry"
          >
            Try Again
          </Button>
        </div>
      </section>
    );
  }

  // Show "No results" only if we have data but no papers
  if (data && !isLoading && data.papers.length === 0 && searchState.accumulatedResults.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <h3 className="text-gray-900 font-medium mb-2">No results found</h3>
          <p className="text-gray-600">
            Try adjusting your search terms or expanding your selected sources.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Results Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-1">Search Results</h3>
          <p className="text-gray-600" data-testid="text-result-count">
            {searchState.accumulatedResults.length > 0 ? searchState.accumulatedResults.length : (data?.total || 0)} results found for "{searchState.query}"
          </p>
          
          {/* Source Status */}
          {data?.sourceStatus && (
            <div className="flex flex-wrap gap-2 mt-2">
              {Object.entries(data.sourceStatus).map(([source, status]) => (
                <div
                  key={source}
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    status.status === 'success' 
                      ? 'bg-green-100 text-green-700' 
                      : status.status === 'error'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  <span className="capitalize">{source}</span>
                  {status.status === 'success' && status.count && (
                    <span className="ml-1">({status.count})</span>
                  )}
                  {status.status === 'error' && (
                    <span className="ml-1">⚠️</span>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Errors */}
          {data?.errors && data.errors.length > 0 && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="text-yellow-800 font-medium text-sm mb-1">Some sources had issues:</h4>
              <ul className="text-yellow-700 text-sm space-y-1">
                {data.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <Button variant="outline" size="sm" data-testid="button-filter">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Search Results Grid */}
      <div className="space-y-6">
        {(searchState.accumulatedResults.length > 0 ? searchState.accumulatedResults : (data?.papers || [])).map((paper) => (
          <PaperCard key={paper.id} paper={paper} />
        ))}
      </div>
    </section>
  );
}
