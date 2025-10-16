import fetch from 'node-fetch';

/**
 * Google Search Service for ResearchAgent
 * Provides web search capabilities for real-time information gathering
 */

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
}

interface GoogleSearchResponse {
  items?: SearchResult[];
  searchInformation?: {
    totalResults: string;
    searchTime: number;
  };
}

export class GoogleSearchService {
  private apiKey: string | undefined;
  private searchEngineId: string | undefined;
  private enabled: boolean;

  constructor() {
    this.apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    this.searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
    this.enabled = !!(this.apiKey && this.searchEngineId);
    
    if (!this.enabled) {
      console.log("⚠️  Google Search not configured. Set GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_ENGINE_ID to enable web search.");
    }
  }

  async search(query: string, numResults: number = 5): Promise<{
    results: SearchResult[];
    summary: string;
    searchTime: number;
  }> {
    if (!this.enabled) {
      console.log(`🔍 Search simulation for: "${query}"`);
      return this.getMockResults(query);
    }

    try {
      const url = `https://www.googleapis.com/customsearch/v1?key=${this.apiKey}&cx=${this.searchEngineId}&q=${encodeURIComponent(query)}&num=${numResults}`;
      
      const response = await fetch(url);
      const data = await response.json() as GoogleSearchResponse;

      if (!response.ok) {
        throw new Error(`Search API error: ${response.status}`);
      }

      const results = data.items || [];
      const searchTime = data.searchInformation?.searchTime || 0;

      return {
        results,
        summary: this.generateSearchSummary(query, results),
        searchTime
      };
    } catch (error) {
      console.error('Google Search error:', error);
      return this.getMockResults(query);
    }
  }

  private getMockResults(query: string): {
    results: SearchResult[];
    summary: string;
    searchTime: number;
  } {
    // Return simulated search results for demo purposes
    const mockResults: SearchResult[] = [
      {
        title: `${query} - Overview and Latest Updates`,
        link: `https://example.com/search/${encodeURIComponent(query)}`,
        snippet: `Comprehensive information about ${query}. This is a simulated search result for demonstration purposes.`,
        displayLink: 'example.com'
      },
      {
        title: `${query} - Research and Analysis`,
        link: `https://research.example.com/${encodeURIComponent(query)}`,
        snippet: `In-depth analysis and research findings related to ${query}. Includes recent developments and expert insights.`,
        displayLink: 'research.example.com'
      },
      {
        title: `${query} - News and Updates`,
        link: `https://news.example.com/${encodeURIComponent(query)}`,
        snippet: `Latest news and updates about ${query}. Stay informed with recent developments and trending information.`,
        displayLink: 'news.example.com'
      }
    ];

    return {
      results: mockResults,
      summary: this.generateSearchSummary(query, mockResults),
      searchTime: 0.1
    };
  }

  private generateSearchSummary(query: string, results: SearchResult[]): string {
    if (results.length === 0) {
      return `No search results found for "${query}".`;
    }

    const topResults = results.slice(0, 3);
    const summary = topResults.map((result, index) => 
      `${index + 1}. **${result.title}**\n   ${result.snippet}\n   Source: ${result.displayLink}`
    ).join('\n\n');

    return `Search Results for "${query}" (${results.length} results):\n\n${summary}`;
  }

  async searchMultiple(queries: string[]): Promise<{
    allResults: { query: string; results: SearchResult[]; summary: string }[];
    combinedSummary: string;
  }> {
    const searchPromises = queries.map(async (query) => {
      const searchResult = await this.search(query, 3);
      return {
        query,
        results: searchResult.results,
        summary: searchResult.summary
      };
    });

    const allResults = await Promise.all(searchPromises);
    
    const combinedSummary = allResults.map(result => 
      `**Query: ${result.query}**\n${result.summary}`
    ).join('\n\n---\n\n');

    return {
      allResults,
      combinedSummary
    };
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  getConfiguration(): { hasApiKey: boolean; hasEngineId: boolean; enabled: boolean } {
    return {
      hasApiKey: !!this.apiKey,
      hasEngineId: !!this.searchEngineId,
      enabled: this.enabled
    };
  }
}

// Singleton instance
export const googleSearchService = new GoogleSearchService();