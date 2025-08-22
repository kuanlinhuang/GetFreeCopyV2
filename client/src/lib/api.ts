import { apiRequest } from "./queryClient";
import type { SearchRequest, SearchResponse } from "@shared/schema";

export async function searchPapers(params: SearchRequest): Promise<SearchResponse> {
  const response = await apiRequest("POST", "/api/search", params);
  return response.json();
}
