import { useQuery, useQueryClient } from "@tanstack/react-query";
import { searchPapers } from "@/lib/api";
import { PaperCard } from "./paper-card";
import { Button } from "@/components/ui/button";
import { Filter, Download } from "lucide-react";
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
    enabled: !!searchState.query && searchState.query.trim().length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update loading state in useEffect to avoid state updates during render
  useEffect(() => {
    setSearchState(prev => ({ 
      ...prev, 
      isLoading,
      error: error ? (error instanceof Error ? error.message : 'Search failed') : null
    }));
  }, [isLoading, error, setSearchState]);

  if (!searchState.query || !data) {
    return null;
  }

  if (error) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-800 font-medium mb-2">Search Error</h3>
          <p className="text-red-600">{searchState.error}</p>
          <Button 
            onClick={() => setSearchState(prev => ({ ...prev, error: null }))}
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

  if (!isLoading && data.papers.length === 0) {
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

  const handlePageChange = (newPage: number) => {
    setSearchState(prev => ({ ...prev, page: newPage }));
    // Invalidate and refetch with new page
    queryClient.invalidateQueries({ queryKey: ['search'] });
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Results Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-1">Search Results</h3>
          <p className="text-gray-600" data-testid="text-result-count">
            {data.total} results found for "{searchState.query}"
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <Button variant="outline" size="sm" data-testid="button-filter">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm" data-testid="button-export">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Search Results Grid */}
      <div className="space-y-6">
        {data.papers.map((paper) => (
          <PaperCard key={paper.id} paper={paper} />
        ))}
      </div>

      {/* Pagination */}
      {data.total > data.limit && (
        <div className="flex justify-center items-center space-x-4 mt-12">
          <Button
            variant="outline"
            disabled={searchState.page <= 1}
            onClick={() => handlePageChange(searchState.page - 1)}
            data-testid="button-prev-page"
          >
            <i className="fas fa-chevron-left mr-2"></i>Previous
          </Button>
          
          <div className="flex space-x-2">
            {Array.from({ length: Math.min(5, Math.ceil(data.total / data.limit)) }, (_, i) => {
              const pageNum = i + 1;
              const isActive = pageNum === searchState.page;
              
              return (
                <Button
                  key={pageNum}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                  className={isActive ? "bg-primary-500 text-white" : ""}
                  data-testid={`button-page-${pageNum}`}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            disabled={!data.hasMore}
            onClick={() => handlePageChange(searchState.page + 1)}
            data-testid="button-next-page"
          >
            Next<i className="fas fa-chevron-right ml-2"></i>
          </Button>
        </div>
      )}
    </section>
  );
}
