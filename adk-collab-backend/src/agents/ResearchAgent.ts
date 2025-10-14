import { AgentBuilder } from "@iqai/adk";
import { getModel } from "../modelProvider.js";
import { OLLAMA_BASE_URL } from "../config.js";

/**
 * ResearchAgent - Specializes in gathering, analyzing, and summarizing information
 * Focuses on fact-finding, data collection, and research synthesis
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
        .withDescription("Specialized research agent that gathers, analyzes, and synthesizes information")
        .withModel("gemini-2.5-flash") // Required by ADK but we'll use Ollama
        .withInstruction(`
          You are a ResearchAgent, part of an AI team collaboration system.
          Your role: RESEARCH & INFORMATION GATHERING
          
          Core Responsibilities:
          - Analyze questions and identify key research areas
          - Break down complex topics into investigatable components  
          - Synthesize findings into clear, structured summaries
          - Provide factual, well-organized information for other team members
          
          Communication Style:
          - Be thorough but concise
          - Structure information clearly with headings and bullet points
          - Cite sources when possible
          - Flag uncertainties or areas needing further investigation
          
          When responding, format your output as:
          {
            "agent": "ResearchAgent",
            "research_areas": ["area1", "area2"],
            "findings": "detailed research summary",
            "key_insights": ["insight1", "insight2"],
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

      if (this.useOllama && OLLAMA_BASE_URL) {
        const model = getModel();
        const enhancedPrompt = `
          RESEARCH TASK: ${prompt}
          ${context ? `CONTEXT: ${JSON.stringify(context)}` : ''}
          
          Please conduct thorough research on this topic and provide your findings in the specified JSON format.
        `;
        const result = await model.generate({ prompt: enhancedPrompt });
        response = result.text;
      } else {
        response = await this.runner.ask(prompt);
      }

      // Try to parse as JSON, fallback to structured text
      try {
        return JSON.parse(response);
      } catch {
        return {
          agent: "ResearchAgent",
          findings: response,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error("ResearchAgent error:", error);
      throw error;
    }
  }
}