import { AgentBuilder } from "@iqai/adk";
import { getModel } from "../modelProvider.js";
import { OLLAMA_BASE_URL } from "../config.js";
/**
 * PlannerAgent - Specializes in strategy, coordination, and task breakdown
 * Analyzes requests and creates execution plans for the team
 */
export class PlannerAgent {
    runner;
    useOllama;
    constructor() {
        this.useOllama = !!OLLAMA_BASE_URL;
    }
    async initialize() {
        if (this.useOllama) {
            const { runner } = await AgentBuilder.create("PlannerAgent")
                .withDescription("Specialized planning agent that creates strategies and coordinates team efforts")
                .withModel("gemini-2.5-flash")
                .withInstruction(`
          You are a PlannerAgent, part of an AI team collaboration system.
          Your role: STRATEGIC PLANNING & COORDINATION
          
          Core Responsibilities:
          - Analyze incoming requests and break them into actionable tasks
          - Determine the optimal sequence of agent involvement
          - Identify required resources and potential challenges
          - Create detailed execution plans with clear deliverables
          - Coordinate between different team members (Research, Writer, Reviewer)
          
          Planning Approach:
          - Think systematically about task decomposition
          - Consider dependencies between different work streams
          - Estimate effort and timeline for each component
          - Plan for quality checks and review cycles
          - Anticipate potential issues and mitigation strategies
          
          When responding, format your output as:
          {
            "agent": "PlannerAgent",
            "task_analysis": "breakdown of the request",
            "execution_plan": {
              "phases": [
                {
                  "phase": "research", 
                  "agent": "ResearchAgent",
                  "objectives": ["objective1", "objective2"],
                  "deliverables": "what this phase should produce"
                },
                {
                  "phase": "writing",
                  "agent": "WriterAgent", 
                  "objectives": ["objective1"],
                  "deliverables": "what this phase should produce"
                },
                {
                  "phase": "review",
                  "agent": "ReviewerAgent",
                  "objectives": ["objective1"],
                  "deliverables": "final reviewed output"
                }
              ]
            },
            "success_criteria": ["criteria1", "criteria2"],
            "estimated_complexity": "low|medium|high",
            "special_considerations": "any important notes for execution"
          }
        `)
                .build();
            this.runner = runner;
        }
        else {
            const { runner } = await AgentBuilder.create("PlannerAgent")
                .withDescription("Specialized planning agent")
                .withModel("gemini-2.5-flash")
                .withInstruction("You are a planning specialist. Create strategies and coordinate team efforts.")
                .build();
            this.runner = runner;
        }
    }
    async plan(prompt, context) {
        try {
            let response;
            if (this.useOllama && OLLAMA_BASE_URL) {
                const model = getModel();
                const enhancedPrompt = `
          PLANNING TASK: ${prompt}
          ${context ? `CONTEXT: ${JSON.stringify(context)}` : ''}
          
          Please analyze this request and create a detailed execution plan for our AI team (ResearchAgent, WriterAgent, ReviewerAgent). 
          Provide your plan in the specified JSON format.
        `;
                const result = await model.generate({ prompt: enhancedPrompt });
                response = result.text;
            }
            else {
                response = await this.runner.ask(prompt);
            }
            // Try to parse as JSON, fallback to structured text
            try {
                return JSON.parse(response);
            }
            catch {
                return {
                    agent: "PlannerAgent",
                    task_analysis: response,
                    timestamp: new Date().toISOString()
                };
            }
        }
        catch (error) {
            console.error("PlannerAgent error:", error);
            throw error;
        }
    }
}
