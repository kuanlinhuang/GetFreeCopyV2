import { type Paper, type SearchRequest, type SearchResponse } from "../shared/schema.js";

export interface IStorage {
  // No persistent storage needed for this application
  // All data comes from external APIs
}

export class MemStorage implements IStorage {
  constructor() {
    // No persistent storage required
  }
}

export const storage = new MemStorage();

/**
 * Simple in-memory cache for search results
 * In production, this should be replaced with Redis or similar
 */

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

class SearchCache {
  private cache = new Map<string, CacheEntry>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes
  private readonly maxSize = 1000; // Maximum number of cached entries

  /**
   * Generate cache key from search parameters
   */
  private generateKey(params: any): string {
    return `search:${JSON.stringify(params)}`;
  }

  /**
   * Get cached result if available and not expired
   */
  get(params: any): any | null {
    const key = this.generateKey(params);
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  /**
   * Store result in cache
   */
  set(params: any, data: any, ttl?: number): void {
    const key = this.generateKey(params);
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    };
    
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    
    this.cache.set(key, entry);
  }

  /**
   * Clear expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of Array.from(this.cache.entries())) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; maxSize: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
    };
  }
}

export const searchCache = new SearchCache();

// Clean up expired entries every 5 minutes
setInterval(() => {
  searchCache.cleanup();
}, 5 * 60 * 1000);
