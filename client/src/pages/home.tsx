import { useState, useEffect } from "react";
import { SearchInterface } from "@/components/search-interface";
import { SearchResults } from "@/components/search-results";
import { LoadingOverlay } from "@/components/loading-overlay";
import type { SearchState } from "@/types";
import { getSearchCounter } from "@/lib/api";

export default function Home() {
  const [searchState, setSearchState] = useState<SearchState>({
    query: "",
    filters: {
      sources: ['arxiv', 'medrxiv', 'biorxiv', 'pmc'],
      dateFilter: 'any',
      sortBy: 'relevance',
    },
    page: 1,
    isLoading: false,
    error: null,
    shouldSearch: false,
    accumulatedResults: [],
  });

  const [searchCount, setSearchCount] = useState<number>(3000);

  // Fetch search counter on component mount and when search is performed
  useEffect(() => {
    const fetchSearchCounter = async () => {
      try {
        const data = await getSearchCounter();
        setSearchCount(data.searchCount);
      } catch (error) {
        console.error('Failed to fetch search counter:', error);
      }
    };

    fetchSearchCounter();
  }, [searchState.shouldSearch]); // Refresh counter when search is triggered

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                <i className="fas fa-file-alt text-white text-xl"></i>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">GetFreeCopy</h1>
                <p className="text-sm text-gray-500">Academic Research Access</p>
              </div>
            </div>
            
            {/* About text in header */}
            <div className="hidden md:block">
              <p className="text-sm text-gray-600 max-w-md">
                Making academic research accessible by providing a unified search experience across multiple free databases.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Search */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Discover Academic Research Papers</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Search across arXiv, medRxiv, bioRxiv, and PMC to find free research papers
            </p>
          </div>

          <SearchInterface 
            searchState={searchState} 
            setSearchState={setSearchState} 
          />
        </div>
      </section>

      {/* Search Results */}
      <SearchResults 
        searchState={searchState} 
        setSearchState={setSearchState} 
      />

      {/* Loading Overlay */}
      <LoadingOverlay isVisible={searchState.isLoading} />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center space-y-2">
            <p className="text-sm text-gray-500">
              <span className="font-medium">{searchCount.toLocaleString()}</span> searches powered so far
            </p>
            <p className="text-sm text-gray-500">
              Proudly made by <a href="https://precisionomics.org" target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:text-primary-600 font-medium">Huang Lab</a> at the <span className="font-medium">Icahn School of Medicine at Mount Sinai</span>
            </p>
            <p className="text-sm text-gray-500">
              Data sources: <a href="https://arxiv.org" className="hover:text-primary-500 transition-colors">arXiv</a>, <a href="https://www.medrxiv.org" className="hover:text-primary-500 transition-colors">medRxiv</a>, <a href="https://www.biorxiv.org" className="hover:text-primary-500 transition-colors">bioRxiv</a>, <a href="https://www.ncbi.nlm.nih.gov/pmc/" className="hover:text-primary-500 transition-colors">PMC</a>
            </p>
            <p className="text-sm text-gray-500">&copy; 2025 GetFreeCopy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
