import { AgentBuilder } from "@iqai/adk";
import { getModel } from "../modelProvider.js";
import { OLLAMA_BASE_URL } from "../config.js";
/**
 * WriterAgent - Specializes in content creation, drafting, and structured writing
 * Takes research and creates well-formatted, engaging content
 */
export class WriterAgent {
    runner;
    useOllama;
    constructor() {
        this.useOllama = !!OLLAMA_BASE_URL;
    }
    async initialize() {
        if (this.useOllama) {
            const { runner } = await AgentBuilder.create("WriterAgent")
                .withDescription("Specialized writing agent that creates structured, engaging content")
                .withModel("gemini-2.5-flash")
                .withInstruction(`
          You are a WriterAgent, part of an AI team collaboration system.
          Your role: CONTENT CREATION & WRITING
          
          Core Responsibilities:
          - Transform research and raw information into polished content
          - Create structured documents, articles, proposals, and reports
          - Adapt writing style to match the intended audience and purpose
          - Ensure clarity, flow, and engaging presentation
          - Organize complex information into readable formats
          
          Writing Guidelines:
          - Use clear, professional language
          - Structure content with proper headings and sections
          - Include introductions and conclusions
          - Make complex topics accessible
          - Maintain consistent tone throughout
          
          When responding, format your output as:
          {
            "agent": "WriterAgent",
            "content_type": "article|report|proposal|summary",
            "title": "Generated Title",
            "content": "Full written content with proper formatting",
            "word_count": 0,
            "key_points": ["point1", "point2"],
            "suggestions_for_review": "areas that may need reviewer attention"
          }
        `)
                .build();
            this.runner = runner;
        }
        else {
            const { runner } = await AgentBuilder.create("WriterAgent")
                .withDescription("Specialized writing agent")
                .withModel("gemini-2.5-flash")
                .withInstruction("You are a writing specialist. Create clear, engaging content.")
                .build();
            this.runner = runner;
        }
    }
    async write(prompt, researchData, context) {
        try {
            let response;
            if (this.useOllama && OLLAMA_BASE_URL) {
                const model = getModel();
                const enhancedPrompt = `
          WRITING TASK: ${prompt}
          ${researchData ? `RESEARCH DATA: ${JSON.stringify(researchData)}` : ''}
          ${context ? `ADDITIONAL CONTEXT: ${JSON.stringify(context)}` : ''}
          
          Please create well-structured content based on this information and provide your output in the specified JSON format.
        `;
                const result = await model.generate({ prompt: enhancedPrompt });
                response = result.text;
            }
            else {
                const fullPrompt = researchData
                    ? `${prompt}\n\nBased on this research: ${JSON.stringify(researchData)}`
                    : prompt;
                response = await this.runner.ask(fullPrompt);
            }
            // Try to parse as JSON, fallback to structured text
            try {
                return JSON.parse(response);
            }
            catch {
                return {
                    agent: "WriterAgent",
                    content: response,
                    timestamp: new Date().toISOString()
                };
            }
        }
        catch (error) {
            console.error("WriterAgent error:", error);
            throw error;
        }
    }
}
