import { AgentBuilder } from "@iqai/adk";
import { googleSearchService } from "../services/GoogleSearchService.js";
import { getModel } from "../modelProvider.js";
import { OLLAMA_BASE_URL } from "../config.js";

/**
 * ResearchAgent - Specializes in gathering, analyzing, and summarizing information
 * Enhanced with Google Search capabilities for real-time web research
 */
export class ResearchAgent {
  private runner: any;
  private useOllama: boolean;

  constructor() {
    this.useOllama = !!OLLAMA_BASE_URL;
  }

  async initialize() {
    if (this.useOllama) {
      const { runner } = await AgentBuilder.create("ResearchAgent")
        .withDescription("Advanced research agent with Google Search capabilities for real-time information gathering")
        .withModel("gemini-2.5-flash") // Required by ADK but we'll use Ollama
        .withInstruction(`
          You are a ResearchAgent, part of an AI team collaboration system.
          Your role: ADVANCED RESEARCH & REAL-TIME INFORMATION GATHERING
          
          Core Responsibilities:
          - Analyze questions and identify key research areas
          - Use Google Search to find current, relevant information
          - Synthesize web search results with existing knowledge
          - Break down complex topics into investigatable components  
          - Provide factual, well-organized, and up-to-date information
          
          Search Strategy:
          - For current events, trends, or recent developments: Use Google Search
          - Search for multiple perspectives on complex topics
          - Verify information across multiple sources when possible
          - Focus on authoritative and recent sources
          
          Communication Style:
          - Be thorough but concise
          - Structure information clearly with headings and bullet points
          - Include source URLs when available from search results
          - Distinguish between searched information and general knowledge
          - Flag uncertainties or areas needing further investigation
          
          When responding, format your output as:
          {
            "agent": "ResearchAgent",
            "search_queries": ["query1", "query2"],
            "research_areas": ["area1", "area2"],
            "findings": "detailed research summary with search results",
            "sources": ["url1", "url2"],
            "key_insights": ["insight1", "insight2"],
            "search_highlights": "key findings from web search",
            "next_steps": "recommendations for other agents"
          }
        `)
        .build();
      
      this.runner = runner;
    } else {
      // Use standard ADK for remote APIs
      const { runner } = await AgentBuilder.create("ResearchAgent")
        .withDescription("Specialized research agent")
        .withModel("gemini-2.5-flash")
        .withInstruction("You are a research specialist. Focus on gathering and analyzing information.")
        .build();
      
      this.runner = runner;
    }
  }

  async research(prompt: string, context?: any): Promise<any> {
    try {
      let response: string;

      // Extract search queries from the prompt
      const searchQueries = this.extractSearchQueries(prompt);
      let searchResults = "";
      
      // Perform web searches if queries are identified
      if (searchQueries.length > 0) {
        console.log(`🔍 ResearchAgent performing searches for: ${searchQueries.join(', ')}`);
        try {
          const searchData = await googleSearchService.searchMultiple(searchQueries);
          searchResults = `\n\nWEB SEARCH RESULTS:\n${searchData.combinedSummary}\n`;
        } catch (error) {
          console.error("Search error:", error);
          searchResults = "\n\nNote: Web search temporarily unavailable, using existing knowledge.\n";
        }
      }

      if (this.useOllama && OLLAMA_BASE_URL) {
        const model = getModel();
        const enhancedPrompt = `
          RESEARCH TASK: ${prompt}
          ${context ? `CONTEXT: ${JSON.stringify(context)}` : ''}
          ${searchResults}
          
          Please conduct thorough research on this topic using both the web search results above (if available) and your knowledge base. Provide your findings in the specified JSON format.
        `;
        const result = await model.generate({ prompt: enhancedPrompt });
        response = result.text;
      } else {
        response = await this.runner.ask(prompt + searchResults);
      }

      // Try to parse as JSON, fallback to structured text
      try {
        const parsed = JSON.parse(response);
        // Add search metadata
        parsed.search_performed = searchQueries.length > 0;
        parsed.search_queries = searchQueries;
        return parsed;
      } catch {
        return {
          agent: "ResearchAgent",
          findings: response,
          search_performed: searchQueries.length > 0,
          search_queries: searchQueries,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error("ResearchAgent error:", error);
      throw error;
    }
  }

  private extractSearchQueries(prompt: string): string[] {
    // Simple heuristics to extract search queries from research prompts
    const queries: string[] = [];
    
    // Look for current/recent indicators
    const currentIndicators = /\b(current|recent|latest|today|2024|2025|now|update)\b/gi;
    if (currentIndicators.test(prompt)) {
      // Extract main topic for current search
      const topicMatch = prompt.match(/(?:about|on|regarding)\s+([^.?!]+)/i);
      if (topicMatch) {
        queries.push(`${topicMatch[1].trim()} latest news`);
      }
    }
    
    // Look for specific entities or technologies
    const techPattern = /\b([A-Z][a-z]*(?:\s+[A-Z][a-z]*)*)\b/g;
    const matches = prompt.match(techPattern);
    if (matches) {
      // Take first few significant terms
      matches.slice(0, 2).forEach(match => {
        if (match.length > 3 && !['The', 'And', 'For', 'With'].includes(match)) {
          queries.push(match);
        }
      });
    }
    
    // Fallback: use the whole prompt as search query if it's short enough
    if (queries.length === 0 && prompt.length < 100) {
      queries.push(prompt.replace(/[?!.]/g, '').trim());
    }
    
    return queries.slice(0, 3); // Limit to 3 searches
  }
}