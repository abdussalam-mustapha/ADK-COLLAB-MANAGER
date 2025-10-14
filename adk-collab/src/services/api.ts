// API configuration
const API_BASE_URL = 'http://localhost:5000';

// Types for API responses
export interface AgentStatus {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'idle' | 'working';
  isOnline: boolean;
}

export interface TaskRequest {
  task: string;
  agents?: string[];
}

export interface TaskResponse {
  taskId: string;
  status: 'initiated' | 'in-progress' | 'completed' | 'failed';
  agents: string[];
  messages: AgentMessage[];
}

export interface AgentMessage {
  id: string;
  agentId: string;
  agentName: string;
  role: string;
  content: string;
  timestamp: string;
  type: 'research' | 'content' | 'review' | 'planning';
}

export interface CollaborationSession {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'paused';
  participants: string[];
  startTime: string;
  messages: AgentMessage[];
}

// API Client class
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Health check
  async checkHealth(): Promise<{ status: string; timestamp: string }> {
    return this.request('/health');
  }

  // Team management
  async getTeamStatus(): Promise<any> {
    return this.request('/api/team/status');
  }

  async startTeamCollaboration(taskRequest: TaskRequest): Promise<TaskResponse> {
    return this.request('/api/team/collaborate', {
      method: 'POST',
      body: JSON.stringify({ prompt: taskRequest.task, options: taskRequest.agents }),
    });
  }

  async clearTeamHistory(): Promise<void> {
    return this.request('/api/team/clear-history', {
      method: 'POST',
    });
  }

  // Single agent interaction (fallback)
  async askSingleAgent(prompt: string): Promise<{ reply: string }> {
    return this.request('/api/ask', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
  }
}

// Create and export API client instance
export const apiClient = new ApiClient();

// Utility functions for error handling
export const handleApiError = (error: any): string => {
  if (error.message?.includes('fetch')) {
    return 'Unable to connect to the server. Please check if the backend is running.';
  }
  
  if (error.message?.includes('API Error')) {
    return `Server error: ${error.message}`;
  }
  
  return error.message || 'An unexpected error occurred';
};

// WebSocket client for real-time updates (if needed)
export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private onMessageCallback: ((data: any) => void) | null = null;

  constructor(url: string = 'ws://localhost:5000/ws') {
    this.url = url;
  }

  connect(onMessage?: (data: any) => void): void {
    if (onMessage) {
      this.onMessageCallback = onMessage;
    }

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (this.onMessageCallback) {
            this.onMessageCallback(data);
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, 1000 * this.reconnectAttempts);
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }
}

export const wsClient = new WebSocketClient();