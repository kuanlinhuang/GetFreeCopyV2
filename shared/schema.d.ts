import { z } from "zod";
export declare const paperSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    authors: z.ZodArray<z.ZodString, "many">;
    abstract: z.ZodString;
    doi: z.ZodOptional<z.ZodString>;
    pmid: z.ZodOptional<z.ZodString>;
    arxivId: z.ZodOptional<z.ZodString>;
    source: z.ZodEnum<["arxiv", "medrxiv", "biorxiv", "pmc"]>;
    category: z.ZodOptional<z.ZodString>;
    publishedDate: z.ZodString;
    url: z.ZodString;
    keywords: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    journalRef: z.ZodOptional<z.ZodString>;
    comments: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    title?: string;
    authors?: string[];
    abstract?: string;
    doi?: string;
    pmid?: string;
    arxivId?: string;
    source?: "arxiv" | "medrxiv" | "biorxiv" | "pmc";
    category?: string;
    publishedDate?: string;
    url?: string;
    keywords?: string[];
    journalRef?: string;
    comments?: string;
}, {
    id?: string;
    title?: string;
    authors?: string[];
    abstract?: string;
    doi?: string;
    pmid?: string;
    arxivId?: string;
    source?: "arxiv" | "medrxiv" | "biorxiv" | "pmc";
    category?: string;
    publishedDate?: string;
    url?: string;
    keywords?: string[];
    journalRef?: string;
    comments?: string;
}>;
export declare const searchRequestSchema: z.ZodObject<{
    query: z.ZodString;
    sources: z.ZodDefault<z.ZodArray<z.ZodEnum<["arxiv", "medrxiv", "biorxiv", "pmc"]>, "many">>;
    dateFilter: z.ZodDefault<z.ZodEnum<["any", "last_30_days", "last_6_months", "last_year", "2025", "2024"]>>;
    sortBy: z.ZodDefault<z.ZodEnum<["relevance", "date_newest", "date_oldest", "citations"]>>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    query?: string;
    sources?: ("arxiv" | "medrxiv" | "biorxiv" | "pmc")[];
    dateFilter?: "any" | "last_30_days" | "last_6_months" | "last_year" | "2025" | "2024";
    sortBy?: "relevance" | "date_newest" | "date_oldest" | "citations";
    page?: number;
    limit?: number;
}, {
    query?: string;
    sources?: ("arxiv" | "medrxiv" | "biorxiv" | "pmc")[];
    dateFilter?: "any" | "last_30_days" | "last_6_months" | "last_year" | "2025" | "2024";
    sortBy?: "relevance" | "date_newest" | "date_oldest" | "citations";
    page?: number;
    limit?: number;
}>;
export declare const searchResponseSchema: z.ZodObject<{
    papers: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        authors: z.ZodArray<z.ZodString, "many">;
        abstract: z.ZodString;
        doi: z.ZodOptional<z.ZodString>;
        pmid: z.ZodOptional<z.ZodString>;
        arxivId: z.ZodOptional<z.ZodString>;
        source: z.ZodEnum<["arxiv", "medrxiv", "biorxiv", "pmc"]>;
        category: z.ZodOptional<z.ZodString>;
        publishedDate: z.ZodString;
        url: z.ZodString;
        keywords: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        journalRef: z.ZodOptional<z.ZodString>;
        comments: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        title?: string;
        authors?: string[];
        abstract?: string;
        doi?: string;
        pmid?: string;
        arxivId?: string;
        source?: "arxiv" | "medrxiv" | "biorxiv" | "pmc";
        category?: string;
        publishedDate?: string;
        url?: string;
        keywords?: string[];
        journalRef?: string;
        comments?: string;
    }, {
        id?: string;
        title?: string;
        authors?: string[];
        abstract?: string;
        doi?: string;
        pmid?: string;
        arxivId?: string;
        source?: "arxiv" | "medrxiv" | "biorxiv" | "pmc";
        category?: string;
        publishedDate?: string;
        url?: string;
        keywords?: string[];
        journalRef?: string;
        comments?: string;
    }>, "many">;
    total: z.ZodNumber;
    page: z.ZodNumber;
    limit: z.ZodNumber;
    hasMore: z.ZodBoolean;
    sourceStatus: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        status: z.ZodEnum<["pending", "success", "error"]>;
        count: z.ZodOptional<z.ZodNumber>;
        error: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status?: "pending" | "success" | "error";
        error?: string;
        count?: number;
    }, {
        status?: "pending" | "success" | "error";
        error?: string;
        count?: number;
    }>>>;
    errors: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    page?: number;
    limit?: number;
    papers?: {
        id?: string;
        title?: string;
        authors?: string[];
        abstract?: string;
        doi?: string;
        pmid?: string;
        arxivId?: string;
        source?: "arxiv" | "medrxiv" | "biorxiv" | "pmc";
        category?: string;
        publishedDate?: string;
        url?: string;
        keywords?: string[];
        journalRef?: string;
        comments?: string;
    }[];
    total?: number;
    hasMore?: boolean;
    sourceStatus?: Record<string, {
        status?: "pending" | "success" | "error";
        error?: string;
        count?: number;
    }>;
    errors?: string[];
}, {
    page?: number;
    limit?: number;
    papers?: {
        id?: string;
        title?: string;
        authors?: string[];
        abstract?: string;
        doi?: string;
        pmid?: string;
        arxivId?: string;
        source?: "arxiv" | "medrxiv" | "biorxiv" | "pmc";
        category?: string;
        publishedDate?: string;
        url?: string;
        keywords?: string[];
        journalRef?: string;
        comments?: string;
    }[];
    total?: number;
    hasMore?: boolean;
    sourceStatus?: Record<string, {
        status?: "pending" | "success" | "error";
        error?: string;
        count?: number;
    }>;
    errors?: string[];
}>;
export type Paper = z.infer<typeof paperSchema>;
export type SearchRequest = z.infer<typeof searchRequestSchema>;
export type SearchResponse = z.infer<typeof searchResponseSchema>;
//# sourceMappingURL=schema.d.ts.map