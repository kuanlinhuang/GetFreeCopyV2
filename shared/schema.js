"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchResponseSchema = exports.searchRequestSchema = exports.paperSchema = void 0;
const zod_1 = require("zod");
exports.paperSchema = zod_1.z.object({
    id: zod_1.z.string(),
    title: zod_1.z.string(),
    authors: zod_1.z.array(zod_1.z.string()),
    abstract: zod_1.z.string(),
    doi: zod_1.z.string().optional(),
    pmid: zod_1.z.string().optional(),
    arxivId: zod_1.z.string().optional(),
    source: zod_1.z.enum(['arxiv', 'medrxiv', 'biorxiv', 'pmc']),
    category: zod_1.z.string().optional(),
    publishedDate: zod_1.z.string(),
    url: zod_1.z.string(),
    keywords: zod_1.z.array(zod_1.z.string()).default([]),
    journalRef: zod_1.z.string().optional(),
    comments: zod_1.z.string().optional(),
});
exports.searchRequestSchema = zod_1.z.object({
    query: zod_1.z.string().min(1),
    sources: zod_1.z.array(zod_1.z.enum(['arxiv', 'medrxiv', 'biorxiv', 'pmc'])).default(['arxiv', 'medrxiv', 'biorxiv', 'pmc']),
    dateFilter: zod_1.z.enum(['any', 'last_30_days', 'last_6_months', 'last_year', '2025', '2024']).default('any'),
    sortBy: zod_1.z.enum(['relevance', 'date_newest', 'date_oldest', 'citations']).default('relevance'),
    page: zod_1.z.number().min(1).default(1),
    limit: zod_1.z.number().min(1).max(100).default(20),
});
exports.searchResponseSchema = zod_1.z.object({
    papers: zod_1.z.array(exports.paperSchema),
    total: zod_1.z.number(),
    page: zod_1.z.number(),
    limit: zod_1.z.number(),
    hasMore: zod_1.z.boolean(),
    sourceStatus: zod_1.z.record(zod_1.z.object({
        status: zod_1.z.enum(['pending', 'success', 'error']),
        count: zod_1.z.number().optional(),
        error: zod_1.z.string().optional(),
    })).optional(),
    errors: zod_1.z.array(zod_1.z.string()).optional(),
});
//# sourceMappingURL=schema.js.map