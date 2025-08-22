import { type Paper, type SearchRequest, type SearchResponse } from "@shared/schema";

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
