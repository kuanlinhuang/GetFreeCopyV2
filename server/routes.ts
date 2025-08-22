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
      searchQuery += `+AND+submittedDate:[20240101*+TO+20241231*]`;
    }

    const url = `http://export.arxiv.org/api/query?search_query=${searchQuery}&start=${startIndex}&max_results=${limit}`;
    
    const response = await fetch(url);
    const xmlText = await response.text();
    
    // Parse XML response
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    const entries = xmlDoc.getElementsByTagName('entry');
    
    const papers: Paper[] = [];
    
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const title = entry.getElementsByTagName('title')[0]?.textContent?.trim() || '';
      const summary = entry.getElementsByTagName('summary')[0]?.textContent?.trim() || '';
      const published = entry.getElementsByTagName('published')[0]?.textContent?.trim() || '';
      const id = entry.getElementsByTagName('id')[0]?.textContent?.trim() || '';
      const arxivId = id.split('/').pop() || '';
      
      const authors: string[] = [];
      const authorElements = entry.getElementsByTagName('author');
      for (let j = 0; j < authorElements.length; j++) {
        const name = authorElements[j].getElementsByTagName('name')[0]?.textContent?.trim();
        if (name) authors.push(name);
      }
      
      const categories: string[] = [];
      const categoryElements = entry.getElementsByTagName('category');
      for (let k = 0; k < categoryElements.length; k++) {
        const term = categoryElements[k].getAttribute('term');
        if (term) categories.push(term);
      }
      
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
      interval = '2024-01-01/2024-12-31';
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
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.collection) return [];
    
    // Filter by query in title or abstract
    const filteredPapers = data.collection.filter((paper: any) => {
      const titleMatch = paper.title?.toLowerCase().includes(query.toLowerCase()) || false;
      const abstractMatch = paper.abstract?.toLowerCase().includes(query.toLowerCase()) || false;
      return titleMatch || abstractMatch;
    });
    
    const papers: Paper[] = filteredPapers.slice(0, limit).map((paper: any) => ({
      id: paper.doi || paper.preprint_doi,
      title: paper.title || '',
      authors: paper.authors ? paper.authors.split(';').map((a: string) => a.trim()) : [],
      abstract: paper.abstract || '',
      doi: paper.doi,
      source: server,
      category: paper.category || '',
      publishedDate: paper.date || '',
      url: `https://www.${server}.org/content/10.1101/${paper.doi || paper.preprint_doi}`,
      keywords: paper.category ? [paper.category] : [],
    }));
    
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
      term += `+AND+2024[PDAT]`;
    }
    
    // First, search for PMIDs
    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pmc&term=${term}&retmode=json&retmax=${limit}&retstart=${retstart}`;
    
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    
    if (!searchData.esearchresult?.idlist || searchData.esearchresult.idlist.length === 0) {
      return [];
    }
    
    // Then fetch details for found PMIDs
    const pmids = searchData.esearchresult.idlist.join(',');
    const fetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pmc&id=${pmids}&retmode=xml`;
    
    const fetchResponse = await fetch(fetchUrl);
    const xmlText = await fetchResponse.text();
    
    // Parse XML response
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    const articles = xmlDoc.getElementsByTagName('article');
    
    const papers: Paper[] = [];
    
    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      
      const titleElement = article.querySelector('article-title');
      const title = titleElement?.textContent?.trim() || '';
      
      const abstractElement = article.querySelector('abstract p');
      const abstract = abstractElement?.textContent?.trim() || '';
      
      const authors: string[] = [];
      const authorElements = article.querySelectorAll('contrib[contrib-type="author"] name');
      authorElements.forEach(author => {
        const surname = author.querySelector('surname')?.textContent || '';
        const givenNames = author.querySelector('given-names')?.textContent || '';
        if (surname || givenNames) {
          authors.push(`${givenNames} ${surname}`.trim());
        }
      });
      
      const pmidElement = article.querySelector('article-id[pub-id-type="pmid"]');
      const pmid = pmidElement?.textContent || '';
      
      const pmcIdElement = article.querySelector('article-id[pub-id-type="pmc"]');
      const pmcId = pmcIdElement?.textContent || '';
      
      const pubDateElement = article.querySelector('pub-date');
      const year = pubDateElement?.querySelector('year')?.textContent || '';
      const month = pubDateElement?.querySelector('month')?.textContent || '01';
      const day = pubDateElement?.querySelector('day')?.textContent || '01';
      const publishedDate = year ? `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}` : '';
      
      papers.push({
        id: pmcId || pmid,
        title,
        authors,
        abstract,
        pmid,
        source: 'pmc',
        publishedDate,
        url: `https://www.ncbi.nlm.nih.gov/pmc/articles/${pmcId}/`,
        keywords: [],
      });
    }
    
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
