import type { Express } from "express";
import { createServer, type Server } from "http";
import { searchRequestSchema, type SearchResponse, type Paper } from "@shared/schema";
import { z } from "zod";

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

async function searchBioRxiv(query: string, server: 'biorxiv' | 'medrxiv', dateFilter: string, page: number, limit: number): Promise<Paper[]> {
  try {
    let interval = '100'; // Default to recent papers
    
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
    }
    
    const cursor = (page - 1) * limit;
    const url = `https://api.biorxiv.org/details/${server}/${interval}/${cursor}/json`;
    
    console.log(`${server} API URL:`, url);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`${server} API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.collection || !Array.isArray(data.collection)) {
      console.log(`${server} returned no collection data`);
      return [];
    }
    
    // Filter by query in title or abstract
    const filteredPapers = data.collection.filter((paper: any) => {
      const titleMatch = paper.title?.toLowerCase().includes(query.toLowerCase()) || false;
      const abstractMatch = paper.abstract?.toLowerCase().includes(query.toLowerCase()) || false;
      return titleMatch || abstractMatch;
    });
    
    const papers: Paper[] = filteredPapers.slice(0, limit).map((paper: any) => {
      const doiValue = paper.doi || paper.preprint_doi || '';
      return {
        id: doiValue,
        title: paper.title || '',
        authors: paper.authors ? paper.authors.split(';').map((a: string) => a.trim()) : [],
        abstract: paper.abstract || '',
        doi: paper.doi,
        source: server,
        category: paper.category || '',
        publishedDate: paper.date || '',
        url: doiValue ? `https://www.${server}.org/content/10.1101/${doiValue}` : '#',
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

async function searchPMC(query: string, dateFilter: string, page: number, limit: number): Promise<Paper[]> {
  try {
    const retstart = (page - 1) * limit;
    
    let term = `${encodeURIComponent(query)}[Title/Abstract]`;
    
    // Add date filtering for PMC
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
      const month = String(sixMonthsAgo.getMonth() + 7).padStart(2, '0'); // PMC uses different date format
      term += `+AND+${year}/${month}[PDAT]:3000[PDAT]`;
    }
    
    // First, search for PMIDs
    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pmc&term=${term}&retmode=json&retmax=${limit}&retstart=${retstart}&sort=pub_date`;
    
    console.log('PMC search URL:', searchUrl);
    
    const searchResponse = await fetch(searchUrl);
    if (!searchResponse.ok) {
      throw new Error(`PMC search API responded with status: ${searchResponse.status}`);
    }
    
    const searchData = await searchResponse.json();
    
    if (!searchData.esearchresult?.idlist || searchData.esearchresult.idlist.length === 0) {
      console.log('PMC search returned no results');
      return [];
    }
    
    // Then fetch details for found PMIDs
    const pmcIds = searchData.esearchresult.idlist.join(',');
    const fetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pmc&id=${pmcIds}&retmode=xml`;
    
    const fetchResponse = await fetch(fetchUrl);
    if (!fetchResponse.ok) {
      throw new Error(`PMC fetch API responded with status: ${fetchResponse.status}`);
    }
    
    const xmlText = await fetchResponse.text();
    
    // Simple XML parsing for Node.js
    const articleMatches = xmlText.match(/<article[^>]*>[\s\S]*?<\/article>/g) || [];
    const papers: Paper[] = [];
    
    for (const articleXml of articleMatches) {
      try {
        const title = articleXml.match(/<article-title[^>]*>([\s\S]*?)<\/article-title>/)?.[1]?.trim().replace(/<[^>]*>/g, '') || '';
        
        // Try to find abstract
        const abstractMatch = articleXml.match(/<abstract[^>]*>([\s\S]*?)<\/abstract>/)?.[1] || '';
        const abstract = abstractMatch.replace(/<[^>]*>/g, '').trim() || '';
        
        const authors: string[] = [];
        const authorMatches = articleXml.match(/<contrib contrib-type="author"[^>]*>[\s\S]*?<\/contrib>/g) || [];
        for (const authorMatch of authorMatches) {
          const surname = authorMatch.match(/<surname[^>]*>([\s\S]*?)<\/surname>/)?.[1]?.trim() || '';
          const givenNames = authorMatch.match(/<given-names[^>]*>([\s\S]*?)<\/given-names>/)?.[1]?.trim() || '';
          if (surname || givenNames) {
            authors.push(`${givenNames} ${surname}`.trim());
          }
        }
        
        const pmid = articleXml.match(/<article-id pub-id-type="pmid"[^>]*>([\s\S]*?)<\/article-id>/)?.[1]?.trim() || '';
        const pmcId = articleXml.match(/<article-id pub-id-type="pmc"[^>]*>([\s\S]*?)<\/article-id>/)?.[1]?.trim() || '';
        
        // Try to extract publication date
        const pubDateMatch = articleXml.match(/<pub-date[^>]*>[\s\S]*?<\/pub-date>/);
        let publishedDate = '';
        if (pubDateMatch) {
          const year = pubDateMatch[0].match(/<year[^>]*>([\s\S]*?)<\/year>/)?.[1] || '';
          const month = pubDateMatch[0].match(/<month[^>]*>([\s\S]*?)<\/month>/)?.[1] || '01';
          const day = pubDateMatch[0].match(/<day[^>]*>([\s\S]*?)<\/day>/)?.[1] || '01';
          if (year) {
            publishedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          }
        }
        
        if (title && (abstract || authors.length > 0)) {
          papers.push({
            id: pmcId || pmid,
            title,
            authors,
            abstract,
            pmid,
            source: 'pmc',
            publishedDate,
            url: pmcId ? `https://www.ncbi.nlm.nih.gov/pmc/articles/${pmcId}/` : `https://www.ncbi.nlm.nih.gov/pubmed/${pmid}`,
            keywords: [],
          });
        }
      } catch (entryError) {
        console.error('Error parsing PMC entry:', entryError);
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
  // Search endpoint
  app.post("/api/search", async (req, res) => {
    try {
      const searchParams = searchRequestSchema.parse(req.body);
      const { query, sources, dateFilter, sortBy, page, limit } = searchParams;
      
      // Search all enabled sources in parallel
      const searchPromises: Promise<Paper[]>[] = [];
      
      if (sources.includes('arxiv')) {
        searchPromises.push(searchArxiv(query, dateFilter, page, limit));
      }
      
      if (sources.includes('medrxiv')) {
        searchPromises.push(searchBioRxiv(query, 'medrxiv', dateFilter, page, limit));
      }
      
      if (sources.includes('biorxiv')) {
        searchPromises.push(searchBioRxiv(query, 'biorxiv', dateFilter, page, limit));
      }
      
      if (sources.includes('pmc')) {
        searchPromises.push(searchPMC(query, dateFilter, page, limit));
      }
      
      // Wait for all searches to complete
      const results = await Promise.allSettled(searchPromises);
      
      // Combine all successful results
      const allPapers: Paper[] = [];
      results.forEach(result => {
        if (result.status === 'fulfilled') {
          allPapers.push(...result.value);
        }
      });
      
      // Sort results
      let sortedPapers = [...allPapers];
      if (sortBy === 'date_newest') {
        sortedPapers.sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());
      } else if (sortBy === 'date_oldest') {
        sortedPapers.sort((a, b) => new Date(a.publishedDate).getTime() - new Date(b.publishedDate).getTime());
      }
      
      // Paginate results (since we already have page-specific results from APIs)
      const total = sortedPapers.length;
      const hasMore = total >= limit;
      
      const response: SearchResponse = {
        papers: sortedPapers,
        total,
        page,
        limit,
        hasMore,
      };
      
      res.json(response);
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ message: 'Search failed', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
