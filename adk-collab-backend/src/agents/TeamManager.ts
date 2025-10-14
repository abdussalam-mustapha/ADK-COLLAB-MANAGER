import { ResearchAgent } from "./ResearchAgent.js";
import { WriterAgent } from "./WriterAgent.js";
import { ReviewerAgent } from "./ReviewerAgent.js";
import { PlannerAgent } from "./PlannerAgent.js";
import { fileStorage, type StoredSession } from "../storage/FileStorage.js";

/**
 * TeamManager - Orchestrates collaboration between specialized agents
 * This is the main coordination layer that simulates team collaboration
 */
export class TeamManager {
  private researchAgent: ResearchAgent;
  private writerAgent: WriterAgent;
  private reviewerAgent: ReviewerAgent;
  private plannerAgent: PlannerAgent;
  private isInitialized = false;
  private conversationHistory: any[] = [];

  constructor() {
    this.researchAgent = new ResearchAgent();
    this.writerAgent = new WriterAgent();
    this.reviewerAgent = new ReviewerAgent();
    this.plannerAgent = new PlannerAgent();
  }

  async initialize() {
    try {
      console.log("🚀 Initializing AI Team...");
      
      // Initialize file storage
      await fileStorage.init();
      console.log("💾 Storage system initialized");
      
      // Initialize all agents in parallel
      await Promise.all([
        this.researchAgent.initialize(),
        this.writerAgent.initialize(),
        this.reviewerAgent.initialize(),
        this.plannerAgent.initialize()
      ]);

      this.isInitialized = true;
      console.log("✅ AI Team initialized successfully");
      console.log("👥 Team Members: PlannerAgent, ResearchAgent, WriterAgent, ReviewerAgent");
    } catch (error) {
      console.error("❌ Failed to initialize AI Team:", error);
      throw error;
    }
  }

  /**
   * Main collaboration method - processes user requests through the team
   */
  async collaborate(userPrompt: string, options?: {
    skipPlanning?: boolean;
    skipResearch?: boolean;
    skipWriting?: boolean;
    skipReview?: boolean;
    customWorkflow?: string[];
  }): Promise<any> {
    if (!this.isInitialized) {
      throw new Error("TeamManager not initialized. Call initialize() first.");
    }

    const sessionId = Date.now().toString();
    const collaborationStart = Date.now();
    
    console.log(`\n🎯 Starting Team Collaboration`);
    console.log(`📝 Task: ${userPrompt}`);
    console.log(`🆔 Session: ${sessionId}\n`);

    // Step 1: Planning Phase (unless skipped)
    let planningResult = null;
    if (!options?.skipPlanning) {
      console.log("📋 Phase 1: Strategic Planning...");
      try {
        planningResult = await this.plannerAgent.plan(userPrompt);
        console.log("✅ Planning completed");
        this.addToHistory(sessionId, "PlannerAgent", planningResult);
      } catch (error) {
        console.log("⚠️  Planning failed, proceeding with default workflow");
      }
    }

    // Step 2: Research Phase (unless skipped)
    let researchResult = null;
    if (!options?.skipResearch) {
      console.log("🔍 Phase 2: Research & Information Gathering...");
      try {
        researchResult = await this.researchAgent.research(
          userPrompt, 
          { planning: planningResult, session: sessionId }
        );
        console.log("✅ Research completed");
        this.addToHistory(sessionId, "ResearchAgent", researchResult);
      } catch (error) {
        console.log("⚠️  Research failed:", error instanceof Error ? error.message : String(error));
      }
    }

    // Step 3: Writing Phase (unless skipped)
    let writingResult = null;
    if (!options?.skipWriting) {
      console.log("✍️  Phase 3: Content Creation...");
      try {
        writingResult = await this.writerAgent.write(
          userPrompt,
          researchResult,
          { planning: planningResult, session: sessionId }
        );
        console.log("✅ Writing completed");
        this.addToHistory(sessionId, "WriterAgent", writingResult);
      } catch (error) {
        console.log("⚠️  Writing failed:", error instanceof Error ? error.message : String(error));
      }
    }

    // Step 4: Review Phase (unless skipped)
    let reviewResult = null;
    if (!options?.skipReview && writingResult) {
      console.log("🔍 Phase 4: Quality Review...");
      try {
        reviewResult = await this.reviewerAgent.review(
          writingResult,
          userPrompt,
          { planning: planningResult, research: researchResult, session: sessionId }
        );
        console.log("✅ Review completed");
        this.addToHistory(sessionId, "ReviewerAgent", reviewResult);
      } catch (error) {
        console.log("⚠️  Review failed:", error instanceof Error ? error.message : String(error));
      }
    }

    const collaborationTime = Date.now() - collaborationStart;
    console.log(`\n🎉 Team Collaboration Complete (${collaborationTime}ms)`);

    // Compile final response
    const finalResponse = {
      session_id: sessionId,
      original_prompt: userPrompt,
      collaboration_summary: {
        phases_completed: [
          planningResult ? "planning" : null,
          researchResult ? "research" : null,
          writingResult ? "writing" : null,
          reviewResult ? "review" : null
        ].filter(Boolean),
        total_time_ms: collaborationTime,
        timestamp: new Date().toISOString()
      },
      results: {
        planning: planningResult,
        research: researchResult,
        writing: writingResult,
        review: reviewResult
      },
      final_output: this.synthesizeFinalOutput(
        userPrompt,
        planningResult,
        researchResult,
        writingResult,
        reviewResult
      ),
      conversation_history: this.getSessionHistory(sessionId)
    };

    // Save session to storage
    try {
      const storedSession = await fileStorage.saveSession({
        title: userPrompt.slice(0, 100) + (userPrompt.length > 100 ? '...' : ''),
        description: `Completed in ${collaborationTime}ms with ${finalResponse.collaboration_summary.phases_completed.length} phases`,
        originalPrompt: userPrompt,
        status: 'completed',
        participants: ['PlannerAgent', 'ResearchAgent', 'WriterAgent', 'ReviewerAgent'],
        startTime: new Date(collaborationStart).toISOString(),
        endTime: new Date().toISOString(),
        results: finalResponse.results,
        final_output: finalResponse.final_output,
        conversation_history: finalResponse.conversation_history,
      collaboration_summary: {
        phases_completed: finalResponse.collaboration_summary.phases_completed.filter((phase): phase is string => phase !== null),
        total_time_ms: finalResponse.collaboration_summary.total_time_ms,
        timestamp: finalResponse.collaboration_summary.timestamp
      }
      });
      
      // Update session ID to match stored session
      finalResponse.session_id = storedSession.id;
      console.log(`💾 Session saved with ID: ${storedSession.id}`);
    } catch (error) {
      console.error('⚠️  Failed to save session:', error);
    }

    return finalResponse;
  }

  /**
   * Synthesize the final output from all agent contributions
   */
  private synthesizeFinalOutput(
    originalPrompt: string,
    planning: any,
    research: any,
    writing: any,
    review: any
  ): any {
    // If we have reviewed content, that's typically the best final output
    if (review && writing) {
      return {
        type: "reviewed_content",
        title: writing.title || "AI Team Collaboration Result",
        content: writing.content,
        quality_score: review.overall_score,
        recommendations_applied: review.final_recommendation === "approve",
        summary: `The team successfully completed the task: "${originalPrompt}". ` +
                `Research findings were incorporated into well-structured content, ` +
                `which received a quality score of ${review.overall_score || 'N/A'}.`
      };
    }

    // If we only have writing, return that
    if (writing) {
      return {
        type: "content",
        title: writing.title || "AI Team Result",
        content: writing.content,
        summary: `The team created content for: "${originalPrompt}"`
      };
    }

    // If we only have research, return that
    if (research) {
      return {
        type: "research_summary",
        findings: research.findings,
        key_insights: research.key_insights,
        summary: `The team conducted research on: "${originalPrompt}"`
      };
    }

    // Fallback
    return {
      type: "planning_only",
      plan: planning,
      summary: `The team analyzed the request: "${originalPrompt}" and created an execution plan.`
    };
  }

  /**
   * Add interaction to conversation history
   */
  private addToHistory(sessionId: string, agent: string, result: any) {
    this.conversationHistory.push({
      session: sessionId,
      timestamp: new Date().toISOString(),
      agent,
      result
    });
  }

  /**
   * Get conversation history for a session
   */
  private getSessionHistory(sessionId: string) {
    return this.conversationHistory.filter(h => h.session === sessionId);
  }

  /**
   * Get team status
   */
  getTeamStatus() {
    return {
      initialized: this.isInitialized,
      agents: {
        planner: "PlannerAgent - Strategic planning and task coordination",
        researcher: "ResearchAgent - Information gathering and analysis", 
        writer: "WriterAgent - Content creation and structured writing",
        reviewer: "ReviewerAgent - Quality assurance and improvement"
      },
      active_sessions: [...new Set(this.conversationHistory.map(h => h.session))].length,
      total_interactions: this.conversationHistory.length
    };
  }

  /**
   * Clear conversation history (useful for demos)
   */
  clearHistory() {
    this.conversationHistory = [];
    console.log("🧹 Conversation history cleared");
  }

  /**
   * Get collaboration history from storage
   */
  async getHistory(): Promise<StoredSession[]> {
    try {
      return await fileStorage.getAllSessions();
    } catch (error) {
      console.error('Failed to get history:', error);
      return [];
    }
  }

  /**
   * Get specific session by ID
   */
  async getSession(sessionId: string): Promise<StoredSession | null> {
    try {
      return await fileStorage.getSessionById(sessionId);
    } catch (error) {
      console.error('Failed to get session:', error);
      return null;
    }
  }

  /**
   * Get all available agents
   */
  async getAgents(): Promise<any[]> {
    try {
      return await fileStorage.getAllAgents();
    } catch (error) {
      console.error('Failed to get agents:', error);
      return [];
    }
  }

  /**
   * Add new agent
   */
  async addAgent(agentData: {
    name: string;
    description: string;
    role: string;
    capabilities: string[];
    model?: string;
  }): Promise<any> {
    try {
      return await fileStorage.saveAgent({
        ...agentData,
        model: agentData.model || 'gpt-oss:120b-cloud',
        isActive: true
      });
    } catch (error) {
      console.error('Failed to add agent:', error);
      throw error;
    }
  }

  /**
   * Update agent
   */
  async updateAgent(agentId: string, updates: any): Promise<any> {
    try {
      return await fileStorage.updateAgent(agentId, updates);
    } catch (error) {
      console.error('Failed to update agent:', error);
      throw error;
    }
  }

  /**
   * Delete agent
   */
  async deleteAgent(agentId: string): Promise<boolean> {
    try {
      return await fileStorage.deleteAgent(agentId);
    } catch (error) {
      console.error('Failed to delete agent:', error);
      return false;
    }
  }

  /**
   * Get session statistics
   */
  async getStats(): Promise<any> {
    try {
      return await fileStorage.getSessionStats();
    } catch (error) {
      console.error('Failed to get stats:', error);
      return { total: 0, completed: 0, failed: 0, inProgress: 0 };
    }
  }
}