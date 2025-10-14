import { useState, useEffect, useCallback } from 'react';
import { apiClient, handleApiError, type AgentStatus, type CollaborationSession, type TaskRequest, type CollaborationResult, type StoredAgent, type CreateAgentRequest } from '../services/api';

// Define TaskResponse type to match CollaborationResult from backend
interface TaskResponse {
  taskId: string;
  status: 'completed' | 'failed' | 'in-progress';
  agents: string[];
  messages: {
    id: string;
    agentId: string;
    agentName: string;
    role: string;
    content: string;
    timestamp: string;
    type: 'research' | 'content' | 'review' | 'planning';
  }[];
  // Add properties from CollaborationResult
  success?: boolean;
  session_id?: string;
  original_prompt?: string;
  collaboration_summary?: {
    phases_completed: string[];
    total_time_ms: number;
    timestamp: string;
  };
  results?: {
    planning: string;
    research: string;
    writing: string;
    review: string;
  };
  final_output?: {
    type: string;
    title: string;
    recommendations_applied: boolean;
    summary: string;
    content?: string;
  };
  conversation_history?: Array<{
    session: string;
    timestamp: string;
    agent: string;
    result: string;
  }>;
}

// Custom hook for API state management
export const useApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeRequest = useCallback(async <T>(
    apiCall: () => Promise<T>,
    onSuccess?: (data: T) => void,
    onError?: (error: string) => void
  ): Promise<T | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      if (onSuccess) onSuccess(result);
      return result;
    } catch (err: any) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      if (onError) onError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, error, executeRequest, setError };
};

// Hook for agent management
export const useAgents = () => {
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [teamStatus, setTeamStatus] = useState<any>(null);
  const { isLoading, error, executeRequest } = useApi();

  const fetchAgents = useCallback(async () => {
    return executeRequest(
      () => apiClient.getTeamStatus(),
      (data) => {
        setTeamStatus(data);
        // Convert team status agents to AgentStatus format
        if (data.agents) {
          const agentList: AgentStatus[] = Object.entries(data.agents).map(([id, description]) => ({
            id,
            name: id.charAt(0).toUpperCase() + id.slice(1),
            role: description as string,
            status: 'active' as const,
            isOnline: data.available || false
          }));
          setAgents(agentList);
        }
      }
    );
  }, [executeRequest]);

  const updateAgentStatus = useCallback(async (agentId: string, status: 'active' | 'idle') => {
    // Since the backend doesn't have individual agent status updates,
    // we'll just refetch the team status
    console.log(`Agent ${agentId} status change requested: ${status}`);
    return fetchAgents();
  }, [fetchAgents]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  return {
    agents,
    teamStatus,
    isLoading,
    error,
    fetchAgents,
    updateAgentStatus
  };
};

// Hook for collaboration management
export const useCollaboration = () => {
  const [activeSessions, setActiveSessions] = useState<CollaborationSession[]>([]);
  const [history, setHistory] = useState<CollaborationSession[]>([]);
  const [currentTask, setCurrentTask] = useState<TaskResponse | null>(null);
  const { isLoading, error, executeRequest } = useApi();

  const startCollaboration = useCallback(async (taskRequest: TaskRequest) => {
    return executeRequest(
      () => apiClient.startTeamCollaboration(taskRequest),
      (data: CollaborationResult) => {
        // Transform the backend CollaborationResult to our TaskResponse format
        const taskResponse: TaskResponse = {
          taskId: data.session_id,
          status: data.success ? 'completed' : 'failed',
          agents: ['PlannerAgent', 'ResearchAgent', 'WriterAgent', 'ReviewerAgent'],
          messages: data.conversation_history.map((conv, index) => ({
              id: `msg-${index}`,
              agentId: conv.agent,
              agentName: conv.agent,
              role: 'AI Agent',
              content: conv.result,
              timestamp: new Date(conv.timestamp).toLocaleTimeString(),
              type: 'research' as const
            })),
          // Include all CollaborationResult properties
          success: data.success,
          session_id: data.session_id,
          original_prompt: data.original_prompt,
          collaboration_summary: data.collaboration_summary,
          results: data.results,
          final_output: data.final_output,
          conversation_history: data.conversation_history
        };
        setCurrentTask(taskResponse);
        
        // Refresh history after successful collaboration
        fetchHistory();
      }
    );
  }, [executeRequest]);

  const fetchHistory = useCallback(async () => {
    return executeRequest(
      () => apiClient.getHistory(),
      (data) => {
        // Transform stored sessions to collaboration sessions format
        const transformedHistory: CollaborationSession[] = data.history.map((session: any) => ({
          id: session.id,
          title: session.title,
          description: session.description,
          status: session.status === 'completed' ? 'completed' as const : 
                 session.status === 'in-progress' ? 'active' as const : 'paused' as const,
          participants: session.participants,
          startTime: new Date(session.startTime).toLocaleTimeString(),
          messages: session.conversation_history.map((conv: any, index: number) => ({
            id: `msg-${index}`,
            agentId: conv.agent,
            agentName: conv.agent,
            role: 'AI Agent',
            content: conv.result,
            timestamp: new Date(conv.timestamp).toLocaleTimeString(),
            type: 'research' as const
          }))
        }));
        setHistory(transformedHistory);
      }
    );
  }, [executeRequest]);

  const fetchActiveSessions = useCallback(async () => {
    // Since backend doesn't have this endpoint, use team status as fallback
    return executeRequest(
      () => apiClient.getTeamStatus(),
      (data: any) => {
        // Mock active sessions based on team status
        if (data.available) {
          setActiveSessions([]);
        }
      }
    );
  }, [executeRequest]);

  const getTaskStatus = useCallback(async (_taskId: string) => {
    // Since backend doesn't track individual tasks, return current task
    return currentTask;
  }, [currentTask]);

  useEffect(() => {
    fetchActiveSessions();
    fetchHistory(); // Load history on mount
  }, [fetchActiveSessions, fetchHistory]);

  return {
    activeSessions,
    history,
    currentTask,
    isLoading,
    error,
    startCollaboration,
    fetchActiveSessions,
    fetchHistory,
    getTaskStatus
  };
};

// Hook for backend health monitoring
export const useBackendHealth = () => {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [lastCheck, setLastCheck] = useState<string | null>(null);
  const { executeRequest } = useApi();

  const checkHealth = useCallback(async () => {
    return executeRequest(
      () => apiClient.checkHealth(),
      (data) => {
        setIsHealthy(true);
        setLastCheck(data.timestamp);
      },
      () => {
        setIsHealthy(false);
      }
    );
  }, [executeRequest]);

  useEffect(() => {
    // Check health on mount
    checkHealth();

    // Set up periodic health checks
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [checkHealth]);

  return {
    isHealthy,
    lastCheck,
    checkHealth
  };
};

// Hook for settings management
export const useSettings = () => {
  const [settings, setSettings] = useState<any>({
    ollama: {
      model: 'gpt-oss:120b-cloud',
      serverUrl: 'http://localhost:11434'
    },
    theme: {
      mode: 'dark'
    },
    agents: {
      autoActivate: true,
      defaultDescription: 'A versatile AI agent focused on clear, concise communication.'
    }
  });
  const { isLoading, error, executeRequest } = useApi();

  const fetchSettings = useCallback(async () => {
    // Since backend doesn't have settings yet, use localStorage or defaults
    const savedSettings = localStorage.getItem('adk-collab-settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.warn('Failed to parse saved settings');
      }
    }
    return Promise.resolve();
  }, []);

  const updateSettings = useCallback(async (newSettings: any) => {
    return executeRequest(
      () => {
        // Save to localStorage for now
        localStorage.setItem('adk-collab-settings', JSON.stringify(newSettings));
        return Promise.resolve();
      },
      () => {
        setSettings(newSettings);
      }
    );
  }, [executeRequest]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    isLoading,
    error,
    fetchSettings,
    updateSettings
  };
};

// Hook for real-time updates (WebSocket)
export const useRealTimeUpdates = (onUpdate?: (data: any) => void) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);

  useEffect(() => {
    // Import WebSocket client dynamically to avoid SSR issues
    import('../services/api').then(({ wsClient }) => {
      wsClient.connect((data) => {
        setLastMessage(data);
        if (onUpdate) onUpdate(data);
      });

      // Monitor connection status
      const checkConnection = () => {
        setIsConnected(wsClient !== null);
      };

      checkConnection();
      const interval = setInterval(checkConnection, 5000);

      return () => {
        clearInterval(interval);
        wsClient.disconnect();
      };
    });
  }, [onUpdate]);

  return {
    isConnected,
    lastMessage
  };
};

// Hook for agent management
export const useAgentManagement = () => {
  const [agents, setAgents] = useState<StoredAgent[]>([]);
  const { isLoading, error, executeRequest } = useApi();

  const fetchAgents = useCallback(async () => {
    return executeRequest(
      () => apiClient.getAgents(),
      (data) => {
        setAgents(data.agents);
      }
    );
  }, [executeRequest]);

  const createAgent = useCallback(async (agentData: CreateAgentRequest) => {
    return executeRequest(
      () => apiClient.createAgent(agentData),
      (data) => {
        setAgents(prev => [...prev, data.agent]);
        return data.agent;
      }
    );
  }, [executeRequest]);

  const updateAgent = useCallback(async (agentId: string, updates: Partial<StoredAgent>) => {
    return executeRequest(
      () => apiClient.updateAgent(agentId, updates),
      (data) => {
        setAgents(prev => prev.map(agent => 
          agent.id === agentId ? data.agent : agent
        ));
        return data.agent;
      }
    );
  }, [executeRequest]);

  const deleteAgent = useCallback(async (agentId: string) => {
    return executeRequest(
      () => apiClient.deleteAgent(agentId),
      () => {
        setAgents(prev => prev.filter(agent => agent.id !== agentId));
        return true;
      }
    );
  }, [executeRequest]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  return {
    agents,
    isLoading,
    error,
    fetchAgents,
    createAgent,
    updateAgent,
    deleteAgent
  };
};

// Hook for collaboration statistics
export const useStats = () => {
  const [stats, setStats] = useState<any>(null);
  const { isLoading, error, executeRequest } = useApi();

  const fetchStats = useCallback(async () => {
    return executeRequest(
      () => apiClient.getStats(),
      (data) => {
        setStats(data.stats);
      }
    );
  }, [executeRequest]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    fetchStats
  };
};