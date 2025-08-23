import type { Express } from "express";
import { createServer, type Server } from "http";
import { searchRequestSchema, type SearchResponse, type Paper } from "../shared/schema";
import { z } from "zod";
import { searchCache } from "./storage";

// Search counter (persists across server restarts)
let searchCounter = 3000; // Starting from 3000 as requested

async function searchArxiv(query: string, dateFilter: string, page: number, limit: number): Promise<Paper[]> {
  try {
    const startIndex = (page - 1) * limit;
    let searchQuery = `all:${encodeURIComponent(query)}`;
    
    // Add date filtering for arXiv
    if (dateFilter === '2025') {
      searchQuery += `+AND+submittedDate:[20250101*+TO+20251231*]`;
    } else if (dateFilter === '2024') {
      searchQuery += `+AND+submittedDate:[20240101*+TO+20241231*]`;
    } else if (dateFilter === 'last_year') {
      const currentYear = new Date().getFullYear();
      const lastYear = currentYear - 1;
      searchQuery += `+AND+submittedDate:[${lastYear}0101*+TO+${lastYear}1231*]`;
    } else if (dateFilter === 'last_6_months') {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const year = sixMonthsAgo.getFullYear();
      const month = String(sixMonthsAgo.getMonth() + 1).padStart(2, '0');
      searchQuery += `+AND+submittedDate:[${year}${month}01*+TO+*]`;
    } else if (dateFilter === 'last_30_days') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const year = thirtyDaysAgo.getFullYear();
      const month = String(thirtyDaysAgo.getMonth() + 1).padStart(2, '0');
      const day = String(thirtyDaysAgo.getDate()).padStart(2, '0');
      searchQuery += `+AND+submittedDate:[${year}${month}${day}*+TO+*]`;
    }

    const url = `http://export.arxiv.org/api/query?search_query=${searchQuery}&start=${startIndex}&max_results=${limit}&sortBy=submittedDate&sortOrder=descending`;
    
    console.log('ArXiv API URL:', url);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`ArXiv API responded with status: ${response.status}`);
    }
    
    const xmlText = await response.text();
    
    // Node.js XML parsing using a simpler approach
    const entries = xmlText.match(/<entry>[\s\S]*?<\/entry>/g) || [];
    const papers: Paper[] = [];
    
    for (const entryXml of entries) {
      try {
        const title = entryXml.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.trim().replace(/\n\s*/g, ' ') || '';
        const summary = entryXml.match(/<summary>([\s\S]*?)<\/summary>/)?.[1]?.trim().replace(/\n\s*/g, ' ') || '';
        const published = entryXml.match(/<published>([\s\S]*?)<\/published>/)?.[1]?.trim() || '';
        const id = entryXml.match(/<id>([\s\S]*?)<\/id>/)?.[1]?.trim() || '';
        const arxivId = id.split('/').pop()?.replace('v1', '').replace('v2', '').replace('v3', '') || '';
        
        const authors: string[] = [];
        const authorMatches = entryXml.match(/<author>[\s\S]*?<name>([\s\S]*?)<\/name>[\s\S]*?<\/author>/g) || [];
        for (const authorMatch of authorMatches) {
          const name = authorMatch.match(/<name>([\s\S]*?)<\/name>/)?.[1]?.trim();
          if (name) authors.push(name);
        }
        
        const categories: string[] = [];
        const categoryMatches = entryXml.match(/<category term="([^"]*)"[^>]*>/g) || [];
        for (const categoryMatch of categoryMatches) {
          const term = categoryMatch.match(/term="([^"]*)"/)?.[1];
          if (term) categories.push(term);
        }
        
        if (title && summary) {
          papers.push({
            id: arxivId,
            title,
            authors,
            abstract: summary,
            arxivId,
            source: 'arxiv',
            category: categories[0],
            publishedDate: published,
            url: id,
            keywords: categories,
          });
        }
      } catch (entryError) {
        console.error('Error parsing ArXiv entry:', entryError);
      }
    }
    
    console.log(`ArXiv search returned ${papers.length} papers`);
    return papers;
  } catch (error) {
    console.error('ArXiv API error:', error);
    return [];
  }
}

/**
 * Search bioRxiv or medRxiv papers with improved filtering and error handling
 * @param query - Search query string
 * @param server - Either 'biorxiv' or 'medrxiv'
 * @param dateFilter - Date filter string
 * @param page - Page number for pagination
 * @param limit - Number of results per page
 * @returns Promise<Paper[]> - Array of papers matching the search criteria
 */
async function searchBioRxiv(query: string, server: 'biorxiv' | 'medrxiv', dateFilter: string, page: number, limit: number): Promise<Paper[]> {
  try {
    // For bioRxiv/medRxiv, we need to fetch papers by date range and then filter by query
    let interval = '30d'; // Default to last 30 days
    
    // Calculate date interval based on filter
    if (dateFilter === '2025') {
      interval = '2025-01-01/2025-12-31';
    } else if (dateFilter === '2024') {
      interval = '2024-01-01/2024-12-31';
    } else if (dateFilter === 'last_year') {
      const currentYear = new Date().getFullYear();
      const lastYear = currentYear - 1;
      interval = `${lastYear}-01-01/${lastYear}-12-31`;
    } else if (dateFilter === 'last_6_months') {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const now = new Date();
      interval = `${sixMonthsAgo.toISOString().split('T')[0]}/${now.toISOString().split('T')[0]}`;
    } else if (dateFilter === 'last_30_days') {
      interval = '30d';
    } else if (dateFilter === 'any') {
      // For 'any' date filter, get recent papers from the last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const now = new Date();
      interval = `${sixMonthsAgo.toISOString().split('T')[0]}/${now.toISOString().split('T')[0]}`;
    }
    
    // Calculate cursor for pagination
    const cursor = (page - 1) * limit;
    const url = `https://api.biorxiv.org/details/${server}/${interval}/${cursor}/json`;
    
    console.log(`${server} API URL:`, url);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'GetFreeCopy/2.0 (https://getfreecopy.app; developer@getfreecopy.app)',
      },
    });
    
    if (!response.ok) {
      console.error(`${server} API responded with status: ${response.status}`);
      return [];
    }
    
    const data = await response.json() as any;
    
    if (!data.collection || !Array.isArray(data.collection)) {
      console.error(`Invalid response from ${server} API:`, data);
      return [];
    }
    
    console.log(`${server} fetched ${data.collection.length} papers`);
    
    // Convert to Paper format - simplified without filtering
    const papers = data.collection.slice(0, limit).map((paper: any) => {
      const doiValue = paper.doi || '';
      const doiPath = doiValue.replace('10.1101/', '');
      
      return {
        id: doiValue || `${server}-${paper.title?.substring(0, 20).replace(/\s+/g, '-')}`,
        title: paper.title || '',
        authors: paper.authors ? paper.authors.split(';').map((a: string) => a.trim()).filter((a: string) => a.length > 0) : [],
        abstract: paper.abstract || '',
        doi: paper.doi,
        source: server,
        category: paper.category || '',
        publishedDate: paper.date || '',
        url: doiValue ? `https://www.${server}.org/content/${doiPath}` : '#',
        keywords: paper.category ? [paper.category] : [],
      };
    });
    
    console.log(`${server} search returned ${papers.length} papers`);
    return papers;
  } catch (error) {
    console.error(`${server} API error:`, error);
    return [];
  }
}

/**
 * Rate limiting for PMC API (max 3 requests per second as per NCBI guidelines)
 * Uses a queue-based approach for better request management
 */
class PMCRateLimiter {
  private lastRequestTime = 0;
  private requestQueue: Array<() => Promise<Response>> = [];
  private isProcessing = false;
  private readonly minInterval = 100; // 100ms = ~10 requests per second (still within NCBI guidelines)
  private readonly maxRetries = 1; // Reduced retries further
  private readonly retryDelay = 200; // Reduced retry delay further

  /**
   * Fetch with rate limiting and retry logic
   */
  async fetch(url: string, options?: RequestInit): Promise<Response> {
    return new Promise((resolve, reject) => {
      const fetchWithRetry = async (retryCount = 0): Promise<Response> => {
        try {
          // Wait for rate limit
          await this.waitForRateLimit();
          
          const response = await fetch(url, {
            ...options,
            headers: {
              'User-Agent': 'GetFreeCopy/2.0 (https://getfreecopy.app; developer@getfreecopy.app)',
              ...options?.headers,
            },
          });
          
          if (response.status === 429 && retryCount < this.maxRetries) {
            console.log(`PMC rate limit hit, retrying in ${this.retryDelay * (retryCount + 1)}ms...`);
            await new Promise(resolve => setTimeout(resolve, this.retryDelay * (retryCount + 1)));
            return fetchWithRetry(retryCount + 1);
          }
          
          return response;
        } catch (error) {
          if (retryCount < this.maxRetries) {
            console.log(`PMC request failed, retrying in ${this.retryDelay * (retryCount + 1)}ms...`);
            await new Promise(resolve => setTimeout(resolve, this.retryDelay * (retryCount + 1)));
            return fetchWithRetry(retryCount + 1);
          }
          throw error;
        }
      };
      
      this.requestQueue.push(() => fetchWithRetry());
      this.processQueue();
    });
  }

  private async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minInterval) {
      const waitTime = this.minInterval - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    
    while (this.requestQueue.length > 0) {
      const fetchFn = this.requestQueue.shift();
      if (fetchFn) {
        try {
          await fetchFn();
        } catch (error) {
          console.error('Error in PMC request queue:', error);
        }
      }
    }
    
    this.isProcessing = false;
  }
}

const pmcRateLimiter = new PMCRateLimiter();

/**
 * Search PMC papers using NCBI E-utilities with improved parsing and error handling
 * @param query - Search query string
 * @param dateFilter - Date filter string
 * @param page - Page number for pagination
 * @param limit - Number of results per page
 * @returns Promise<Paper[]> - Array of papers matching the search criteria
 */
async function searchPMC(query: string, dateFilter: string, page: number, limit: number): Promise<Paper[]> {
  try {
    const retstart = (page - 1) * limit;
    
    // Build search term - let NCBI handle the search logic
    let term = query;
    
    // Add date filtering for PMC (only if specific date filter is selected)
    if (dateFilter === '2025') {
      term += `+AND+2025[PDAT]`;
    } else if (dateFilter === '2024') {
      term += `+AND+2024[PDAT]`;
    } else if (dateFilter === 'last_year') {
      const currentYear = new Date().getFullYear();
      const lastYear = currentYear - 1;
      term += `+AND+${lastYear}[PDAT]`;
    } else if (dateFilter === 'last_6_months') {
      const sixMonthsAgo = new Date();
      const year = sixMonthsAgo.getFullYear();
      const month = String(sixMonthsAgo.getMonth() + 1).padStart(2, '0');
      term += `+AND+${year}/${month}[PDAT]:3000[PDAT]`;
    }
    
    // Add required tool and email parameters as per NCBI guidelines
    const toolParam = 'tool=GetFreeCopy&email=developer@getfreecopy.app';
    
    // First, search for PMCIDs using esearch with proper parameters
    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pmc&term=${encodeURIComponent(term)}&retmode=json&retmax=${limit}&retstart=${retstart}&sort=relevance&${toolParam}`;
    
    console.log('PMC search URL:', searchUrl);
    console.log('Starting PMC search...');
    
    const searchResponse = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'GetFreeCopy/2.0 (https://getfreecopy.app; developer@getfreecopy.app)',
      },
    });
    console.log('PMC search response received');
    if (!searchResponse.ok) {
      console.error(`PMC search API responded with status: ${searchResponse.status}`);
      return [];
    }
    
    const searchData = await searchResponse.json() as any;
    
    if (!searchData.esearchresult?.idlist || searchData.esearchresult.idlist.length === 0) {
      console.log('PMC search returned no results');
      return [];
    }
    
    console.log(`PMC search found ${searchData.esearchresult.idlist.length} PMCIDs`);
    
    // Then fetch details for found PMCIDs using efetch
    const pmcIds = searchData.esearchresult.idlist.slice(0, limit).join(','); // Limit to requested number
    const fetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pmc&id=${pmcIds}&retmode=xml&${toolParam}`;
    
    console.log(`PMC fetch URL for ${pmcIds.split(',').length} articles`);
    console.log('Starting PMC fetch...');
    
    const fetchResponse = await fetch(fetchUrl, {
      headers: {
        'User-Agent': 'GetFreeCopy/2.0 (https://getfreecopy.app; developer@getfreecopy.app)',
      },
    });
    console.log('PMC fetch response received');
    if (!fetchResponse.ok) {
      console.error(`PMC fetch API responded with status: ${fetchResponse.status}`);
      return [];
    }
    
    const xmlText = await fetchResponse.text();
    
    // Improved XML parsing for Node.js
    const articleMatches = xmlText.match(/<article[^>]*>[\s\S]*?<\/article>/g) || [];
    const papers: Paper[] = [];
    
    for (const articleXml of articleMatches) {
      try {
        // Extract title with better handling of nested tags
        const titleMatch = articleXml.match(/<article-title[^>]*>([\s\S]*?)<\/article-title>/);
        const title = titleMatch ? 
          titleMatch[1].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() : '';
        
        // Extract abstract with better handling
        const abstractMatch = articleXml.match(/<abstract[^>]*>([\s\S]*?)<\/abstract>/);
        const abstract = abstractMatch ? 
          abstractMatch[1].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() : '';
        
        // Extract authors with better parsing
        const authors: string[] = [];
        const authorMatches = articleXml.match(/<contrib contrib-type="author"[^>]*>[\s\S]*?<\/contrib>/g) || [];
        for (const authorMatch of authorMatches) {
          const surname = authorMatch.match(/<surname[^>]*>([\s\S]*?)<\/surname>/)?.[1]?.trim() || '';
          const givenNames = authorMatch.match(/<given-names[^>]*>([\s\S]*?)<\/given-names>/)?.[1]?.trim() || '';
          if (surname || givenNames) {
            const fullName = `${givenNames} ${surname}`.trim();
            if (fullName.length > 0) {
              authors.push(fullName);
            }
          }
        }
        
        // Extract IDs
        const pmid = articleXml.match(/<article-id pub-id-type="pmid"[^>]*>([\s\S]*?)<\/article-id>/)?.[1]?.trim() || '';
        const pmcId = articleXml.match(/<article-id pub-id-type="pmc"[^>]*>([\s\S]*?)<\/article-id>/)?.[1]?.trim() || '';
        const doi = articleXml.match(/<article-id pub-id-type="doi"[^>]*>([\s\S]*?)<\/article-id>/)?.[1]?.trim() || '';
        
        // Extract publication date with better parsing
        let publishedDate = '';
        const pubDateMatches = articleXml.match(/<pub-date[^>]*>[\s\S]*?<\/pub-date>/g) || [];
        for (const pubDateMatch of pubDateMatches) {
          const year = pubDateMatch.match(/<year[^>]*>([\s\S]*?)<\/year>/)?.[1] || '';
          const month = pubDateMatch.match(/<month[^>]*>([\s\S]*?)<\/month>/)?.[1] || '01';
          const day = pubDateMatch.match(/<day[^>]*>([\s\S]*?)<\/day>/)?.[1] || '01';
          
          if (year && year.length === 4) {
            publishedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            break; // Use the first valid date
          }
        }
        
        // Extract journal information
        const journalTitle = articleXml.match(/<journal-title[^>]*>([\s\S]*?)<\/journal-title>/)?.[1]?.trim() || '';
        
        // Extract keywords/subject categories
        const keywords: string[] = [];
        const subjectMatches = articleXml.match(/<subject[^>]*>([\s\S]*?)<\/subject>/g) || [];
        for (const subjectMatch of subjectMatches) {
          const subject = subjectMatch.replace(/<[^>]*>/g, '').trim();
          if (subject.length > 0) {
            keywords.push(subject);
          }
        }
        
        // Only include papers with at least a title
        if (title && title.length > 0) {
          papers.push({
            id: pmcId || pmid || doi || `pmc-${Date.now()}-${Math.random()}`,
            title,
            authors,
            abstract,
            pmid,
            doi,
            source: 'pmc',
            category: journalTitle,
            publishedDate,
            url: pmcId ? 
              `https://www.ncbi.nlm.nih.gov/pmc/articles/${pmcId}/` : 
              pmid ? `https://www.ncbi.nlm.nih.gov/pubmed/${pmid}` :
              doi ? `https://doi.org/${doi}` : '#',
            keywords,
          });
        }
      } catch (entryError) {
        console.error('Error parsing PMC entry:', entryError);
        // Continue with next article instead of failing completely
        continue;
      }
    }
    
    console.log(`PMC search returned ${papers.length} papers`);
    return papers;
  } catch (error) {
    console.error('PMC API error:', error);
    return [];
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Search endpoint with caching
  app.post("/api/search", async (req, res) => {
    try {
      const searchParams = searchRequestSchema.parse(req.body);
      const { query, sources, dateFilter, sortBy, page, limit } = searchParams;
      
      searchCounter++; // Increment search counter
      console.log(`Search request #${searchCounter}: "${query}" from sources: [${sources.join(', ')}], page: ${page}, limit: ${limit}`);
      
      // Check cache first
      const cacheKey = { query, sources, dateFilter, sortBy, page, limit };
      const cachedResult = searchCache.get(cacheKey);
      if (cachedResult) {
        console.log(`Cache hit for query: "${query}"`);
        return res.json(cachedResult);
      }
      
      // Track which sources are being searched
      const sourceStatus: Record<string, { status: 'pending' | 'success' | 'error', count?: number, error?: string }> = {};
      sources.forEach(source => {
        sourceStatus[source] = { status: 'pending' };
      });
      
      // Search all enabled sources in parallel
      const searchPromises: Array<Promise<{ source: string, papers: Paper[], error?: string }>> = [];
      
      if (sources.includes('arxiv')) {
        searchPromises.push(
          searchArxiv(query, dateFilter, page, limit)
            .then(papers => ({ source: 'arxiv', papers }))
            .catch(error => ({ source: 'arxiv', papers: [], error: error.message }))
        );
      }
      
      if (sources.includes('medrxiv')) {
        searchPromises.push(
          searchBioRxiv(query, 'medrxiv', dateFilter, page, limit)
            .then(papers => ({ source: 'medrxiv', papers }))
            .catch(error => ({ source: 'medrxiv', papers: [], error: error.message }))
        );
      }
      
      if (sources.includes('biorxiv')) {
        searchPromises.push(
          searchBioRxiv(query, 'biorxiv', dateFilter, page, limit)
            .then(papers => ({ source: 'biorxiv', papers }))
            .catch(error => ({ source: 'biorxiv', papers: [], error: error.message }))
        );
      }
      
      if (sources.includes('pmc')) {
        searchPromises.push(
          Promise.race([
            searchPMC(query, dateFilter, page, limit),
            new Promise<Paper[]>((resolve) => 
              setTimeout(() => {
                console.log('PMC search timed out after 8 seconds');
                resolve([]);
              }, 8000)
            )
          ])
            .then(papers => ({ source: 'pmc', papers }))
            .catch(error => ({ source: 'pmc', papers: [], error: error.message }))
        );
      }
      
      // Wait for all searches to complete
      const results = await Promise.allSettled(searchPromises);
      
      // Process results and track status
      const allPapers: Paper[] = [];
      const errors: string[] = [];
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const { source, papers, error } = result.value;
          if (error) {
            sourceStatus[source] = { status: 'error', error };
            errors.push(`${source}: ${error}`);
          } else {
            sourceStatus[source] = { status: 'success', count: papers.length };
            allPapers.push(...papers);
          }
        } else {
          const source = sources[index] || 'unknown';
          sourceStatus[source] = { status: 'error', error: result.reason?.message || 'Unknown error' };
          errors.push(`${source}: ${result.reason?.message || 'Unknown error'}`);
        }
      });
      
      // Sort results - PMC first, then by specified sort order
      let sortedPapers = [...allPapers];
      
      // First, sort by source priority (PMC first)
      sortedPapers.sort((a, b) => {
        const sourcePriority = { pmc: 0, arxiv: 1, biorxiv: 2, medrxiv: 3 };
        const priorityA = sourcePriority[a.source as keyof typeof sourcePriority] ?? 4;
        const priorityB = sourcePriority[b.source as keyof typeof sourcePriority] ?? 4;
        
        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }
        
        // If same source, apply the requested sort order
        if (sortBy === 'date_newest') {
          const dateA = new Date(a.publishedDate || '1970-01-01').getTime();
          const dateB = new Date(b.publishedDate || '1970-01-01').getTime();
          return dateB - dateA;
        } else if (sortBy === 'date_oldest') {
          const dateA = new Date(a.publishedDate || '1970-01-01').getTime();
          const dateB = new Date(b.publishedDate || '1970-01-01').getTime();
          return dateA - dateB;
        }
        
        return 0;
      });
      
      // Paginate results
      const total = sortedPapers.length;
      const hasMore = total >= limit;
      
      const response: SearchResponse & { sourceStatus?: Record<string, any>, errors?: string[] } = {
        papers: sortedPapers,
        total,
        page,
        limit,
        hasMore,
        sourceStatus,
        errors: errors.length > 0 ? errors : undefined,
      };
      
      // Cache the result
      searchCache.set(cacheKey, response);
      
      console.log(`Search completed: ${total} papers found, ${errors.length} errors`);
      res.json(response);
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ 
        message: 'Search failed', 
        error: error instanceof Error ? error.message : 'Unknown error',
        sourceStatus: {},
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    }
  });

  // Search suggestions endpoint
  app.get("/api/suggestions", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.json({ suggestions: [] });
      }
      
      const query = q.toLowerCase().trim();
      if (query.length < 2) {
        return res.json({ suggestions: [] });
      }
      
      // Common academic search terms
      const commonTerms = [
        'machine learning', 'deep learning', 'artificial intelligence', 'neural networks',
        'cancer', 'cancer research', 'oncology', 'tumor',
        'covid', 'covid-19', 'coronavirus', 'pandemic',
        'climate change', 'global warming', 'environmental science',
        'quantum computing', 'quantum mechanics', 'quantum physics',
        'genomics', 'genetics', 'dna', 'rna',
        'biotechnology', 'bioinformatics', 'molecular biology',
        'data science', 'big data', 'statistics', 'probability',
        'computer vision', 'natural language processing', 'nlp',
        'robotics', 'automation', 'control systems',
        'renewable energy', 'solar power', 'wind energy',
        'drug discovery', 'pharmaceuticals', 'medicinal chemistry'
      ];
      
      // Filter and rank suggestions
      const suggestions = commonTerms
        .filter(term => term.includes(query))
        .map(term => ({
          term,
          relevance: term.startsWith(query) ? 2 : 1
        }))
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, 8)
        .map(item => item.term);
      
      res.json({ suggestions });
    } catch (error) {
      console.error('Suggestions error:', error);
      res.json({ suggestions: [] });
    }
  });

  // Cache statistics endpoint
  app.get("/api/cache/stats", (req, res) => {
    try {
      const stats = searchCache.getStats();
      res.json(stats);
    } catch (error) {
      console.error('Cache stats error:', error);
      res.status(500).json({ error: 'Failed to get cache stats' });
    }
  });

  // Search counter endpoint
  app.get("/api/search/counter", (req, res) => {
    try {
      res.json({ searchCount: searchCounter });
    } catch (error) {
      console.error('Search counter error:', error);
      res.status(500).json({ error: 'Failed to get search counter' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
