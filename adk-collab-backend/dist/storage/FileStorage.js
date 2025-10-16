import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
export class FileStorage {
    dataDir;
    sessionsFile;
    agentsFile;
    constructor() {
        this.dataDir = path.join(process.cwd(), 'data');
        this.sessionsFile = path.join(this.dataDir, 'sessions.json');
        this.agentsFile = path.join(this.dataDir, 'agents.json');
    }
    async init() {
        try {
            await fs.mkdir(this.dataDir, { recursive: true });
            // Initialize sessions file if it doesn't exist
            try {
                await fs.access(this.sessionsFile);
            }
            catch {
                await fs.writeFile(this.sessionsFile, JSON.stringify([], null, 2));
            }
            // Initialize agents file if it doesn't exist
            try {
                await fs.access(this.agentsFile);
            }
            catch {
                const defaultAgents = [
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
        }
        catch (error) {
            console.error('Failed to initialize file storage:', error);
            throw error;
        }
    }
    // Session Management
    async getAllSessions() {
        try {
            const data = await fs.readFile(this.sessionsFile, 'utf-8');
            return JSON.parse(data);
        }
        catch (error) {
            console.error('Failed to read sessions:', error);
            return [];
        }
    }
    async getSessionById(id) {
        const sessions = await this.getAllSessions();
        return sessions.find(session => session.id === id) || null;
    }
    async saveSession(sessionData) {
        const sessions = await this.getAllSessions();
        const newSession = {
            ...sessionData,
            id: uuidv4(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        sessions.unshift(newSession); // Add to beginning for most recent first
        await fs.writeFile(this.sessionsFile, JSON.stringify(sessions, null, 2));
        return newSession;
    }
    async updateSession(id, updates) {
        const sessions = await this.getAllSessions();
        const sessionIndex = sessions.findIndex(session => session.id === id);
        if (sessionIndex === -1)
            return null;
        sessions[sessionIndex] = {
            ...sessions[sessionIndex],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        await fs.writeFile(this.sessionsFile, JSON.stringify(sessions, null, 2));
        return sessions[sessionIndex];
    }
    async deleteSession(id) {
        const sessions = await this.getAllSessions();
        const filteredSessions = sessions.filter(session => session.id !== id);
        if (filteredSessions.length === sessions.length)
            return false;
        await fs.writeFile(this.sessionsFile, JSON.stringify(filteredSessions, null, 2));
        return true;
    }
    // Agent Management
    async getAllAgents() {
        try {
            const data = await fs.readFile(this.agentsFile, 'utf-8');
            return JSON.parse(data);
        }
        catch (error) {
            console.error('Failed to read agents:', error);
            return [];
        }
    }
    async getAgentById(id) {
        const agents = await this.getAllAgents();
        return agents.find(agent => agent.id === id) || null;
    }
    async saveAgent(agentData) {
        const agents = await this.getAllAgents();
        const newAgent = {
            ...agentData,
            id: agentData.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        agents.push(newAgent);
        await fs.writeFile(this.agentsFile, JSON.stringify(agents, null, 2));
        return newAgent;
    }
    async updateAgent(id, updates) {
        const agents = await this.getAllAgents();
        const agentIndex = agents.findIndex(agent => agent.id === id);
        if (agentIndex === -1)
            return null;
        agents[agentIndex] = {
            ...agents[agentIndex],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        await fs.writeFile(this.agentsFile, JSON.stringify(agents, null, 2));
        return agents[agentIndex];
    }
    async deleteAgent(id) {
        const agents = await this.getAllAgents();
        const filteredAgents = agents.filter(agent => agent.id !== id);
        if (filteredAgents.length === agents.length)
            return false;
        await fs.writeFile(this.agentsFile, JSON.stringify(filteredAgents, null, 2));
        return true;
    }
    // Analytics
    async getSessionStats() {
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
