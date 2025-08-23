import { Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchSuggestions } from "./search-suggestions";
import type { SearchState, Source } from "@/types";

interface SearchInterfaceProps {
  searchState: SearchState;
  setSearchState: (state: SearchState | ((prev: SearchState) => SearchState)) => void;
}

export function SearchInterface({ searchState, setSearchState }: SearchInterfaceProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSearch = () => {
    if (!searchState.query.trim()) return;
    
    setSearchState(prev => ({
      ...prev,
      page: 1,
      isLoading: true,
      error: null,
      shouldSearch: true, // Trigger the search
      accumulatedResults: [], // Reset accumulated results for new search
    }));
    setShowSuggestions(false);
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setSearchState(prev => ({ 
      ...prev, 
      query: suggestion,
      shouldSearch: false // Don't trigger search automatically when selecting suggestion
    }));
    setShowSuggestions(false);
  };

  const handleSourceToggle = (source: Source, checked: boolean) => {
    setSearchState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        sources: checked 
          ? [...prev.filters.sources, source]
          : prev.filters.sources.filter(s => s !== source)
      }
    }));
  };

  const sources = [
    { id: 'arxiv', label: 'arXiv' },
    { id: 'medrxiv', label: 'medRxiv' },
    { id: 'biorxiv', label: 'bioRxiv' },
    { id: 'pmc', label: 'PMC' },
  ] as const;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
        {/* Main Search Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="Search by title, author, keywords, or DOI..."
              value={searchState.query}
              onChange={(e) => {
                setSearchState(prev => ({ 
                  ...prev, 
                  query: e.target.value,
                  shouldSearch: false // Reset search flag when typing
                }));
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="pl-12 py-3 text-base"
              data-testid="input-search"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            
            <SearchSuggestions
              query={searchState.query}
              onSuggestionSelect={handleSuggestionSelect}
              isVisible={showSuggestions}
              onClose={() => setShowSuggestions(false)}
            />
          </div>
          <Button 
            onClick={handleSearch}
            className="px-8 py-3 bg-primary-500 hover:bg-primary-600 font-medium"
            data-testid="button-search"
            disabled={!searchState.query.trim() || searchState.isLoading}
          >
            Search
          </Button>
        </div>

        {/* Source Selection and Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sources */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Search Sources</label>
            <div className="grid grid-cols-2 gap-2">
              {sources.map((source) => (
                <label 
                  key={source.id}
                  className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:bg-white cursor-pointer"
                >
                  <Checkbox
                    checked={searchState.filters.sources.includes(source.id)}
                    onCheckedChange={(checked) => handleSourceToggle(source.id, !!checked)}
                    data-testid={`checkbox-source-${source.id}`}
                  />
                  <span className="text-sm text-gray-700">{source.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Filters</label>
            <div className="space-y-3">
              <Select
                value={searchState.filters.dateFilter}
                onValueChange={(value: any) => setSearchState(prev => ({
                  ...prev,
                  filters: { ...prev.filters, dateFilter: value }
                }))}
              >
                <SelectTrigger data-testid="select-date-filter">
                  <SelectValue placeholder="Publication Date: Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Publication Date: Any</SelectItem>
                  <SelectItem value="last_year">Last year</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={searchState.filters.sortBy}
                onValueChange={(value: any) => setSearchState(prev => ({
                  ...prev,
                  filters: { ...prev.filters, sortBy: value }
                }))}
              >
                <SelectTrigger data-testid="select-sort">
                  <SelectValue placeholder="Sort by: Relevance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Sort by: Relevance</SelectItem>
                  <SelectItem value="date_newest">Date (Newest)</SelectItem>
                  <SelectItem value="date_oldest">Date (Oldest)</SelectItem>
                  <SelectItem value="citations">Citations</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
