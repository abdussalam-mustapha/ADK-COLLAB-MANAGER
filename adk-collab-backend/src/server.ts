import express from "express";
import cors from "cors";
import { createAgent } from "./agent.js";
import { getModel } from "./modelProvider.js";
import { OLLAMA_BASE_URL } from "./config.js";
import { TeamManager } from "./agents/TeamManager.js";

const app = express();

// Configure CORS to allow requests from the frontend
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Allow both Vite and potential other ports
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Initialize the agent and team
let agentRunner: any;
let useOllama: boolean;
let isInitialized = false;
let teamManager: TeamManager;
let teamInitialized = false;

async function initializeAgent() {
  try {
    const agentConfig = await createAgent();
    agentRunner = agentConfig.runner;
    useOllama = agentConfig.useOllama;
    isInitialized = true;
    
    console.log(`🤖 Single Agent initialized using ${useOllama ? 'Ollama' : 'remote API'}`);
  } catch (error) {
    console.error("Failed to initialize agent:", error);
    process.exit(1);
  }
}

async function initializeTeam() {
  try {
    teamManager = new TeamManager();
    await teamManager.initialize();
    teamInitialized = true;
    
    console.log(`👥 AI Team initialized successfully`);
  } catch (error) {
    console.error("Failed to initialize AI Team:", error);
    // Don't exit - team features will just be unavailable
  }
}

// Single agent endpoint (original functionality)
app.post("/api/ask", async (req, res) => {
  try {
    if (!isInitialized) {
      return res.status(503).json({ error: "Server is still initializing" });
    }

    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    let response: string;

    if (useOllama && OLLAMA_BASE_URL) {
      // Use our custom model provider for Ollama
      const model = getModel();
      const result = await model.generate({ prompt });
      response = result.text;
    } else {
      // Use the ADK agent runner for remote APIs
      response = await agentRunner.ask(prompt);
    }

    res.json({ reply: response });
  } catch (err) {
    console.error("Error processing request:", err);
    res.status(500).json({ 
      error: "Something went wrong",
      details: err instanceof Error ? err.message : String(err)
    });
  }
});

// Team collaboration endpoint - the main feature!
app.post("/api/team/collaborate", async (req, res) => {
  try {
    if (!teamInitialized) {
      return res.status(503).json({ 
        error: "AI Team is not available",
        fallback: "Use /api/ask for single-agent responses"
      });
    }

    const { prompt, options } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    console.log(`\n🎯 Team Collaboration Request: ${prompt}`);
    
    // Process through the AI team
    const collaborationResult = await teamManager.collaborate(prompt, options);
    
    res.json({
      success: true,
      ...collaborationResult
    });

  } catch (err) {
    console.error("Team collaboration error:", err);
    res.status(500).json({ 
      error: "Team collaboration failed",
      details: err instanceof Error ? err.message : String(err)
    });
  }
});

// Get team status
app.get("/api/team/status", (req, res) => {
  if (!teamInitialized) {
    return res.json({
      available: false,
      message: "AI Team not initialized"
    });
  }

  const status = teamManager.getTeamStatus();
  res.json({
    available: true,
    ...status
  });
});

// Clear team conversation history (useful for demos)
app.post("/api/team/clear-history", (req, res) => {
  if (!teamInitialized) {
    return res.status(503).json({ error: "AI Team not available" });
  }

  teamManager.clearHistory();
  res.json({ 
    success: true, 
    message: "Team conversation history cleared" 
  });
});

// New API Endpoints for enhanced functionality

// Get collaboration history
app.get("/api/history", async (req, res) => {
  if (!teamInitialized) {
    return res.status(503).json({ error: "Team not initialized" });
  }
  
  try {
    const history = await teamManager.getHistory();
    res.json({ success: true, history });
  } catch (error) {
    console.error("Error getting history:", error);
    res.status(500).json({ error: "Failed to get history" });
  }
});

// Get specific session
app.get("/api/sessions/:sessionId", async (req, res) => {
  if (!teamInitialized) {
    return res.status(503).json({ error: "Team not initialized" });
  }
  
  try {
    const session = await teamManager.getSession(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    res.json({ success: true, session });
  } catch (error) {
    console.error("Error getting session:", error);
    res.status(500).json({ error: "Failed to get session" });
  }
});

// Get all agents
app.get("/api/agents", async (req, res) => {
  if (!teamInitialized) {
    return res.status(503).json({ error: "Team not initialized" });
  }
  
  try {
    const agents = await teamManager.getAgents();
    res.json({ success: true, agents });
  } catch (error) {
    console.error("Error getting agents:", error);
    res.status(500).json({ error: "Failed to get agents" });
  }
});

// Create new agent
app.post("/api/agents", async (req, res) => {
  if (!teamInitialized) {
    return res.status(503).json({ error: "Team not initialized" });
  }
  
  try {
    const { name, description, role, capabilities, model } = req.body;
    
    if (!name || !description || !role) {
      return res.status(400).json({ error: "Missing required fields: name, description, role" });
    }
    
    const agent = await teamManager.addAgent({
      name,
      description,
      role,
      capabilities: capabilities || [],
      model
    });
    
    res.json({ success: true, agent });
  } catch (error) {
    console.error("Error creating agent:", error);
    res.status(500).json({ error: "Failed to create agent" });
  }
});

// Update agent
app.put("/api/agents/:agentId", async (req, res) => {
  if (!teamInitialized) {
    return res.status(503).json({ error: "Team not initialized" });
  }
  
  try {
    const agent = await teamManager.updateAgent(req.params.agentId, req.body);
    if (!agent) {
      return res.status(404).json({ error: "Agent not found" });
    }
    res.json({ success: true, agent });
  } catch (error) {
    console.error("Error updating agent:", error);
    res.status(500).json({ error: "Failed to update agent" });
  }
});

// Delete agent
app.delete("/api/agents/:agentId", async (req, res) => {
  if (!teamInitialized) {
    return res.status(503).json({ error: "Team not initialized" });
  }
  
  try {
    const success = await teamManager.deleteAgent(req.params.agentId);
    if (!success) {
      return res.status(404).json({ error: "Agent not found" });
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting agent:", error);
    res.status(500).json({ error: "Failed to delete agent" });
  }
});

// Get collaboration statistics
app.get("/api/stats", async (req, res) => {
  if (!teamInitialized) {
    return res.status(503).json({ error: "Team not initialized" });
  }
  
  try {
    const stats = await teamManager.getStats();
    res.json({ success: true, stats });
  } catch (error) {
    console.error("Error getting stats:", error);
    res.status(500).json({ error: "Failed to get stats" });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: isInitialized ? "ok" : "initializing", 
    provider: isInitialized ? (useOllama ? "ollama" : "remote") : "unknown",
    features: {
      single_agent: isInitialized,
      team_collaboration: teamInitialized,
      model_provider: useOllama ? "ollama" : "remote"
    },
    timestamp: new Date().toISOString()
  });
});

const PORT = parseInt(process.env.PORT || '5000');

// Start server and initialize agent
async function startServer() {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📡 Server accessible at http://0.0.0.0:${PORT}`);
  });
  
  // Initialize single agent and team
  await initializeAgent();
  await initializeTeam();
  console.log(`📡 Using ${useOllama ? 'local Ollama' : 'remote API'} for model inference`);
}

startServer().catch(console.error);