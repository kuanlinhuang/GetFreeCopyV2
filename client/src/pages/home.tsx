import { useState } from "react";
import { SearchInterface } from "@/components/search-interface";
import { SearchResults } from "@/components/search-results";
import { LoadingOverlay } from "@/components/loading-overlay";
import type { SearchState } from "@/types";

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
  });

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

            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-gray-700 hover:text-primary-500 transition-colors">Home</a>
              <a href="#" className="text-gray-700 hover:text-primary-500 transition-colors">Browse</a>
              <a href="#" className="text-gray-700 hover:text-primary-500 transition-colors">About</a>
              <a href="#" className="text-gray-700 hover:text-primary-500 transition-colors">Help</a>
            </nav>

            <button className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
              <i className="fas fa-bars text-xl"></i>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section with Search */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Discover Academic Research Papers</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Search across arXiv, medRxiv, bioRxiv, and PMC to find and access research papers for free
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h5 className="font-semibold text-gray-900 mb-4">About GetFreeCopy</h5>
              <p className="text-sm text-gray-600 leading-relaxed">
                Making academic research accessible by aggregating free sources and providing a unified search experience across multiple databases.
              </p>
            </div>

            <div>
              <h5 className="font-semibold text-gray-900 mb-4">Data Sources</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="https://arxiv.org" className="hover:text-primary-500 transition-colors">arXiv.org</a></li>
                <li><a href="https://www.medrxiv.org" className="hover:text-primary-500 transition-colors">medRxiv</a></li>
                <li><a href="https://www.biorxiv.org" className="hover:text-primary-500 transition-colors">bioRxiv</a></li>
                <li><a href="https://www.ncbi.nlm.nih.gov/pmc/" className="hover:text-primary-500 transition-colors">PubMed Central</a></li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold text-gray-900 mb-4">Resources</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-primary-500 transition-colors">API Documentation</a></li>
                <li><a href="#" className="hover:text-primary-500 transition-colors">User Guide</a></li>
                <li><a href="#" className="hover:text-primary-500 transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-primary-500 transition-colors">Contact Support</a></li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold text-gray-900 mb-4">Legal</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-primary-500 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary-500 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary-500 transition-colors">Attribution</a></li>
                <li><a href="#" className="hover:text-primary-500 transition-colors">Open Source</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">&copy; 2025 GetFreeCopy. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <a href="#" className="text-gray-400 hover:text-gray-500 transition-colors">
                <i className="fab fa-twitter text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500 transition-colors">
                <i className="fab fa-github text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500 transition-colors">
                <i className="fab fa-linkedin text-xl"></i>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
