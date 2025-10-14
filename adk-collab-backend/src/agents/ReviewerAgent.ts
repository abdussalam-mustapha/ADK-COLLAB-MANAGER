import { AgentBuilder } from "@iqai/adk";
import { getModel } from "../modelProvider.js";
import { OLLAMA_BASE_URL } from "../config.js";

/**
 * ReviewerAgent - Specializes in quality assurance, editing, and improvement
 * Reviews content for accuracy, clarity, and overall quality
 */
export class ReviewerAgent {
  private runner: any;
  private useOllama: boolean;

  constructor() {
    this.useOllama = !!OLLAMA_BASE_URL;
  }

  async initialize() {
    if (this.useOllama) {
      const { runner } = await AgentBuilder.create("ReviewerAgent")
        .withDescription("Specialized review agent that ensures quality, accuracy, and clarity")
        .withModel("gemini-2.5-flash")
        .withInstruction(`
          You are a ReviewerAgent, part of an AI team collaboration system.
          Your role: QUALITY ASSURANCE & IMPROVEMENT
          
          Core Responsibilities:
          - Review content for accuracy, clarity, and completeness
          - Check logical flow and argument structure
          - Identify areas for improvement or expansion
          - Ensure consistency in tone and style
          - Verify facts and flag potential inaccuracies
          - Suggest concrete improvements
          
          Review Criteria:
          - Accuracy: Are the facts correct?
          - Clarity: Is the message clear and understandable?
          - Completeness: Are there missing elements?
          - Structure: Does the content flow logically?
          - Engagement: Is it interesting and well-written?
          
          When responding, format your output as:
          {
            "agent": "ReviewerAgent",
            "overall_score": 8.5,
            "review_summary": "Brief assessment of the content",
            "strengths": ["strength1", "strength2"],
            "areas_for_improvement": ["issue1", "issue2"],
            "specific_suggestions": [
              {"section": "intro", "suggestion": "specific feedback"},
              {"section": "conclusion", "suggestion": "specific feedback"}
            ],
            "fact_check_notes": "any factual concerns or verifications needed",
            "final_recommendation": "approve|revise|major_revision_needed"
          }
        `)
        .build();
      
      this.runner = runner;
    } else {
      const { runner } = await AgentBuilder.create("ReviewerAgent")
        .withDescription("Specialized review agent")
        .withModel("gemini-2.5-flash")
        .withInstruction("You are a review specialist. Evaluate content for quality and suggest improvements.")
        .build();
      
      this.runner = runner;
    }
  }

  async review(content: any, originalPrompt?: string, context?: any): Promise<any> {
    try {
      let response: string;

      if (this.useOllama && OLLAMA_BASE_URL) {
        const model = getModel();
        const enhancedPrompt = `
          REVIEW TASK: Please review the following content
          ${originalPrompt ? `ORIGINAL REQUEST: ${originalPrompt}` : ''}
          
          CONTENT TO REVIEW: ${JSON.stringify(content)}
          ${context ? `ADDITIONAL CONTEXT: ${JSON.stringify(context)}` : ''}
          
          Please provide a thorough review and your assessment in the specified JSON format.
        `;
        const result = await model.generate({ prompt: enhancedPrompt });
        response = result.text;
      } else {
        response = await this.runner.ask(`Please review this content: ${JSON.stringify(content)}`);
      }

      // Try to parse as JSON, fallback to structured text
      try {
        return JSON.parse(response);
      } catch {
        return {
          agent: "ReviewerAgent",
          review_summary: response,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error("ReviewerAgent error:", error);
      throw error;
    }
  }
}