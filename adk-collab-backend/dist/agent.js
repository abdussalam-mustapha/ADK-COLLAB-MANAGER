import { AgentBuilder } from "@iqai/adk";
import { OLLAMA_BASE_URL } from "./config.js";
/**
 * Create the TeamCollabAgent using the configured model provider
 * If OLLAMA_BASE_URL is set, we'll handle generation in the server directly
 * Otherwise, we'll use the standard ADK model configuration
 */
export async function createAgent() {
    if (OLLAMA_BASE_URL) {
        // When using Ollama, we'll create a simple agent and handle generation manually
        const { agent, runner } = await AgentBuilder.create("TeamCollabAgent")
            .withDescription("An AI agent powered by Ollama via ADK-TS")
            .withModel("gemini-2.5-flash") // Required by ADK but won't be used
            .withInstruction("You are a helpful AI assistant.")
            .build();
        return { agent, runner, useOllama: true };
    }
    else {
        // Use standard ADK model configuration for remote providers
        const { agent, runner } = await AgentBuilder.create("TeamCollabAgent")
            .withDescription("An AI agent powered by remote API")
            .withModel("gemini-2.5-flash") // Or any supported model
            .withInstruction("You are a helpful AI assistant.")
            .build();
        return { agent, runner, useOllama: false };
    }
}
