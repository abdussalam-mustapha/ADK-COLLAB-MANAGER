import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface StoredSession {
  id: string;
  title: string;
  description: string;
  originalPrompt: string;
  status: 'completed' | 'failed' | 'in-progress';
  participants: string[];
  startTime: string;
  endTime?: string;
  results?: {
    planning?: any;
    research?: any;
    writing?: any;
    review?: any;
  };
  final_output?: {
    type: string;
    title: string;
    recommendations_applied: boolean;
    summary: string;
    content?: string;
  };
  conversation_history: Array<{
    session: string;
    timestamp: string;
    agent: string;
    result: any;
  }>;
  collaboration_summary?: {
    phases_completed: string[];
    total_time_ms: number;
    timestamp: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface StoredAgent {
  id: string;
  name: string;
  description: string;
  role: string;
  capabilities: string[];
  model: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export class FileStorage {
  private dataDir: string;
  private sessionsFile: string;
  private agentsFile: string;

  constructor() {
    this.dataDir = path.join(process.cwd(), 'data');
    this.sessionsFile = path.join(this.dataDir, 'sessions.json');
    this.agentsFile = path.join(this.dataDir, 'agents.json');
  }

  async init(): Promise<void> {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
      
      // Initialize sessions file if it doesn't exist
      try {
        await fs.access(this.sessionsFile);
      } catch {
        await fs.writeFile(this.sessionsFile, JSON.stringify([], null, 2));
      }

      // Initialize agents file if it doesn't exist
      try {
        await fs.access(this.agentsFile);
      } catch {
        const defaultAgents: StoredAgent[] = [
          {
            id: 'planner-agent',
            name: 'PlannerAgent',
            description: 'Strategic planning and task coordination specialist',
            role: 'Strategic Coordinator',
            capabilities: ['task-analysis', 'planning', 'coordination'],
            model: 'gpt-oss:120b-cloud',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'research-agent',
            name: 'ResearchAgent',
            description: 'Information gathering and analysis specialist',
            role: 'Data Analyst & Information Gatherer',
            capabilities: ['research', 'analysis', 'data-collection'],
            model: 'gpt-oss:120b-cloud',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'writer-agent',
            name: 'WriterAgent',
            description: 'Content creation and synthesis specialist',
            role: 'Content Creator & Synthesizer',
            capabilities: ['writing', 'content-creation', 'synthesis'],
            model: 'gpt-oss:120b-cloud',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'reviewer-agent',
            name: 'ReviewerAgent',
            description: 'Quality assurance and content review specialist',
            role: 'Quality Assurance & Editor',
            capabilities: ['review', 'quality-assurance', 'editing'],
            model: 'gpt-oss:120b-cloud',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        await fs.writeFile(this.agentsFile, JSON.stringify(defaultAgents, null, 2));
      }
    } catch (error) {
      console.error('Failed to initialize file storage:', error);
      throw error;
    }
  }

  // Session Management
  async getAllSessions(): Promise<StoredSession[]> {
    try {
      const data = await fs.readFile(this.sessionsFile, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to read sessions:', error);
      return [];
    }
  }

  async getSessionById(id: string): Promise<StoredSession | null> {
    const sessions = await this.getAllSessions();
    return sessions.find(session => session.id === id) || null;
  }

  async saveSession(sessionData: Omit<StoredSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<StoredSession> {
    const sessions = await this.getAllSessions();
    const newSession: StoredSession = {
      ...sessionData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    sessions.unshift(newSession); // Add to beginning for most recent first
    await fs.writeFile(this.sessionsFile, JSON.stringify(sessions, null, 2));
    return newSession;
  }

  async updateSession(id: string, updates: Partial<StoredSession>): Promise<StoredSession | null> {
    const sessions = await this.getAllSessions();
    const sessionIndex = sessions.findIndex(session => session.id === id);
    
    if (sessionIndex === -1) return null;
    
    sessions[sessionIndex] = {
      ...sessions[sessionIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await fs.writeFile(this.sessionsFile, JSON.stringify(sessions, null, 2));
    return sessions[sessionIndex];
  }

  async deleteSession(id: string): Promise<boolean> {
    const sessions = await this.getAllSessions();
    const filteredSessions = sessions.filter(session => session.id !== id);
    
    if (filteredSessions.length === sessions.length) return false;
    
    await fs.writeFile(this.sessionsFile, JSON.stringify(filteredSessions, null, 2));
    return true;
  }

  // Agent Management
  async getAllAgents(): Promise<StoredAgent[]> {
    try {
      const data = await fs.readFile(this.agentsFile, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to read agents:', error);
      return [];
    }
  }

  async getAgentById(id: string): Promise<StoredAgent | null> {
    const agents = await this.getAllAgents();
    return agents.find(agent => agent.id === id) || null;
  }

  async saveAgent(agentData: Omit<StoredAgent, 'id' | 'createdAt' | 'updatedAt'>): Promise<StoredAgent> {
    const agents = await this.getAllAgents();
    const newAgent: StoredAgent = {
      ...agentData,
      id: agentData.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    agents.push(newAgent);
    await fs.writeFile(this.agentsFile, JSON.stringify(agents, null, 2));
    return newAgent;
  }

  async updateAgent(id: string, updates: Partial<StoredAgent>): Promise<StoredAgent | null> {
    const agents = await this.getAllAgents();
    const agentIndex = agents.findIndex(agent => agent.id === id);
    
    if (agentIndex === -1) return null;
    
    agents[agentIndex] = {
      ...agents[agentIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await fs.writeFile(this.agentsFile, JSON.stringify(agents, null, 2));
    return agents[agentIndex];
  }

  async deleteAgent(id: string): Promise<boolean> {
    const agents = await this.getAllAgents();
    const filteredAgents = agents.filter(agent => agent.id !== id);
    
    if (filteredAgents.length === agents.length) return false;
    
    await fs.writeFile(this.agentsFile, JSON.stringify(filteredAgents, null, 2));
    return true;
  }

  // Analytics
  async getSessionStats(): Promise<{
    total: number;
    completed: number;
    failed: number;
    inProgress: number;
  }> {
    const sessions = await this.getAllSessions();
    return {
      total: sessions.length,
      completed: sessions.filter(s => s.status === 'completed').length,
      failed: sessions.filter(s => s.status === 'failed').length,
      inProgress: sessions.filter(s => s.status === 'in-progress').length
    };
  }
}

// Singleton instance
export const fileStorage = new FileStorage();