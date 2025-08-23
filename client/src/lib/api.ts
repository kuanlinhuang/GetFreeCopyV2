import { apiRequest } from "./queryClient";
import type { SearchRequest, SearchResponse } from "@shared/schema";

export async function searchPapers(params: SearchRequest): Promise<SearchResponse> {
  const response = await apiRequest("POST", "/api/search", params);
  return response.json();
}

export async function getSearchSuggestions(query: string): Promise<string[]> {
  if (!query || query.length < 2) {
    return [];
  }

  try {
    const response = await fetch(`/api/suggestions?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.suggestions || [];
  } catch (error) {
    console.error('Failed to fetch suggestions:', error);
    return [];
  }
}

export async function getCacheStats(): Promise<{ size: number; maxSize: number }> {
  try {
    const response = await fetch('/api/cache/stats', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get cache stats: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Failed to fetch cache stats:', error);
    throw error;
  }
}

export async function getSearchCounter(): Promise<{ searchCount: number }> {
  try {
    const response = await fetch('/api/search/counter', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get search counter: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Failed to fetch search counter:', error);
    throw error;
  }
}
