import { useState, useEffect, useCallback } from 'react';
import { apiClient, handleApiError, type AgentStatus, type CollaborationSession, type TaskRequest, type TaskResponse } from '../services/api';

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
      (data: any) => {
        // Transform the backend response to our format
        const taskResponse: TaskResponse = {
          taskId: data.collaborationId || 'task-' + Date.now(),
          status: data.success ? 'completed' : 'failed',
          agents: data.agents || [],
          messages: data.conversations?.map((conv: any) => ({
            id: conv.id || Math.random().toString(36),
            agentId: conv.agent || 'unknown',
            agentName: conv.agent || 'Unknown Agent',
            role: conv.role || 'AI Agent',
            content: conv.message || conv.content || '',
            timestamp: new Date().toLocaleTimeString(),
            type: 'research'
          })) || []
        };
        setCurrentTask(taskResponse);
        
        // Add to history for demo purposes
        const newSession: CollaborationSession = {
          id: taskResponse.taskId,
          title: taskRequest.task.slice(0, 50) + '...',
          description: 'Team collaboration session',
          status: 'completed',
          participants: taskResponse.agents,
          startTime: new Date().toLocaleTimeString(),
          messages: taskResponse.messages
        };
        setHistory(prev => [newSession, ...prev]);
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

  const fetchHistory = useCallback(async () => {
    // Since backend doesn't have history endpoint, keep using local state
    // In a real app, you'd implement a history storage mechanism
    return Promise.resolve();
  }, []);

  const getTaskStatus = useCallback(async (taskId: string) => {
    // Since backend doesn't track individual tasks, return current task
    return currentTask;
  }, [currentTask]);

  useEffect(() => {
    fetchActiveSessions();
  }, [fetchActiveSessions]);

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