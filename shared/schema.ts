import { z } from "zod";

export const paperSchema = z.object({
  id: z.string(),
  title: z.string(),
  authors: z.array(z.string()),
  abstract: z.string(),
  doi: z.string().optional(),
  pmid: z.string().optional(),
  arxivId: z.string().optional(),
  source: z.enum(['arxiv', 'medrxiv', 'biorxiv', 'pmc']),
  category: z.string().optional(),
  publishedDate: z.string(),
  url: z.string(),
  keywords: z.array(z.string()).default([]),
  journalRef: z.string().optional(),
  comments: z.string().optional(),
});

export const searchRequestSchema = z.object({
  query: z.string().min(1),
  sources: z.array(z.enum(['arxiv', 'medrxiv', 'biorxiv', 'pmc'])).default(['arxiv', 'medrxiv', 'biorxiv', 'pmc']),
  dateFilter: z.enum(['any', 'last_year', '2025', '2024']).default('any'),
  sortBy: z.enum(['relevance', 'date_newest', 'date_oldest', 'citations']).default('relevance'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

export const searchResponseSchema = z.object({
  papers: z.array(paperSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  hasMore: z.boolean(),
  sourceStatus: z.record(z.object({
    status: z.enum(['pending', 'success', 'error']),
    count: z.number().optional(),
    error: z.string().optional(),
  })).optional(),
  errors: z.array(z.string()).optional(),
});

export type Paper = z.infer<typeof paperSchema>;
export type SearchRequest = z.infer<typeof searchRequestSchema>;
export type SearchResponse = z.infer<typeof searchResponseSchema>;
