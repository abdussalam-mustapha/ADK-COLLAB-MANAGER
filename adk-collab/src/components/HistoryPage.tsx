import React, { useState } from 'react';
import { Clock, Search, Filter, MessageSquare, Users, Calendar, List, Eye } from 'lucide-react';
import './HistoryPage.css';
import { useCollaboration } from '../hooks/useApi';

interface TaskHistoryItem {
  id: string;
  prompt: string;
  agents: string[];
  dateInitiated: string;
  status: 'completed' | 'pending' | 'failed';
}

interface Message {
  id: string;
  agent: string;
  role: string;
  content: string;
  timestamp: string;
  type: 'research' | 'content' | 'review' | 'planning';
}

interface CollaborationFlow {
  id: string;
  title: string;
  description: string;
  participants: string[];
  startTime: string;
  status: 'completed' | 'in-progress' | 'paused';
  messages: Message[];
}

const HistoryPage: React.FC = () => {
  const [selectedFlow, setSelectedFlow] = useState<string | null>('flow-1');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'conversations' | 'tasks'>('conversations');

  // Use real backend data
  const { history: backendHistory, isLoading, error } = useCollaboration();

  // Use backend data if available, fallback to mock data for demo
  const collaborationFlows: CollaborationFlow[] = backendHistory.length > 0 
    ? backendHistory.map(session => ({
        ...session,
        status: session.status === 'active' ? 'in-progress' as const : session.status as 'completed' | 'paused',
        messages: session.messages.map(msg => ({
          id: msg.id,
          agent: msg.agentName,
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
          type: msg.type
        }))
      }))
    : [
    {
      id: 'flow-1',
      title: 'User Onboarding Enhancement Strategy',
      description: 'Real-time interaction and progress tracking for the AI agent team.',
      participants: ['Researcher AI', 'Writer AI', 'Reviewer AI'],
      startTime: '10:00 AM',
      status: 'completed',
      messages: [
        {
          id: 'msg-1',
          agent: 'Researcher AI',
          role: 'Data Analyst & Information Gatherer',
          content: "Okay team, I've identified key trends in user engagement metrics from Q3. The data indicates a significant drop-off in user retention after the onboarding phase. We need to focus on improving the initial user experience.",
          timestamp: '10:00 AM',
          type: 'research'
        },
        {
          id: 'msg-2',
          agent: 'Writer AI',
          role: 'Content Creator & Synthesizer',
          content: "Understood, Researcher. I'll begin drafting a comprehensive content strategy for onboarding improvements, focusing on interactive tutorials and clearer value proposition messaging. Will also suggest A/B testing variations.",
          timestamp: '10:05 AM',
          type: 'content'
        },
        {
          id: 'msg-3',
          agent: 'Reviewer AI',
          role: 'Quality Assurance & Editor',
          content: "Excellent, Writer, ensure the new content strategy aligns with our brand voice guidelines. Researcher, can you prepare a summary of the most impactful retention strategies from our competitors for context? I'll review both outputs for consistency and effectiveness.",
          timestamp: '10:10 AM',
          type: 'review'
        },
        {
          id: 'msg-4',
          agent: 'Researcher AI',
          role: 'Data Analyst & Information Gatherer',
          content: "Acknowledged, Reviewer. Compiling competitor analysis now. Will prioritize actionable insights on retention mechanisms and present key findings within the hour.",
          timestamp: '10:15 AM',
          type: 'research'
        }
      ]
    },
    {
      id: 'flow-2',
      title: 'Product Feature Roadmap Q4',
      description: 'Strategic planning session for upcoming feature releases.',
      participants: ['Planner AI', 'Researcher AI', 'Writer AI'],
      startTime: '2:30 PM',
      status: 'in-progress',
      messages: [
        {
          id: 'msg-5',
          agent: 'Planner AI',
          role: 'Strategic Coordinator',
          content: "Let's begin our Q4 roadmap planning. I need comprehensive market analysis and feature prioritization based on user feedback data.",
          timestamp: '2:30 PM',
          type: 'planning'
        }
      ]
    },
    {
      id: 'flow-3',
      title: 'Marketing Campaign Analysis',
      description: 'Performance review of recent marketing initiatives.',
      participants: ['Researcher AI', 'Writer AI'],
      startTime: 'Yesterday',
      status: 'completed',
      messages: []
    }
  ];

  const taskHistory: TaskHistoryItem[] = [
    {
      id: 'CM-001',
      prompt: 'Research current trends in AI ethics and generate a report.',
      agents: ['Researcher AI', 'Writer AI'],
      dateInitiated: '2024-07-20',
      status: 'completed'
    },
    {
      id: 'CM-002',
      prompt: 'Draft a marketing campaign for the new CollabMind feature.',
      agents: ['Writer AI', 'Reviewer AI'],
      dateInitiated: '2024-07-19',
      status: 'pending'
    },
    {
      id: 'CM-003',
      prompt: 'Analyze user feedback from the Q2 survey and summarize key insights.',
      agents: ['Researcher AI'],
      dateInitiated: '2024-07-18',
      status: 'completed'
    },
    {
      id: 'CM-004',
      prompt: 'Create a technical documentation outline for ADK-TS integration.',
      agents: ['Writer AI', 'Reviewer AI'],
      dateInitiated: '2024-07-17',
      status: 'failed'
    },
    {
      id: 'CM-005',
      prompt: 'Generate five creative blog post ideas about AI collaboration tools.',
      agents: ['Writer AI'],
      dateInitiated: '2024-07-16',
      status: 'completed'
    }
  ];

  const getAgentColor = (type: string) => {
    switch (type) {
      case 'research': return '#3b82f6';
      case 'content': return '#8b5cf6';
      case 'review': return '#10b981';
      case 'planning': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getAgentAvatar = (agent: string) => {
    const firstLetter = agent.charAt(0);
    return firstLetter;
  };

  const filteredFlows = collaborationFlows.filter(flow =>
    flow.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    flow.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTasks = taskHistory.filter(task =>
    task.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedFlowData = collaborationFlows.find(flow => flow.id === selectedFlow);

  return (
    <div className="history-page">
      <div className="history-header">
        <div className="header-content">
          <h1 className="page-title">
            <Clock className="title-icon" />
            Collaboration History
          </h1>
          <p className="page-description">
            Review past agent collaborations and conversation flows
          </p>
        </div>
        
        <div className="header-actions">
          <div className="view-toggle">
            <button 
              className={`toggle-btn ${viewMode === 'conversations' ? 'active' : ''}`}
              onClick={() => setViewMode('conversations')}
            >
              <MessageSquare size={16} />
              Conversations
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'tasks' ? 'active' : ''}`}
              onClick={() => setViewMode('tasks')}
            >
              <List size={16} />
              Task History
            </button>
          </div>
          
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder={viewMode === 'conversations' ? 'Search conversations...' : 'Search history...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button className="filter-button">
            <Filter size={16} />
            Filter
          </button>
        </div>
      </div>

      <div className="history-content">
        {viewMode === 'conversations' ? (
          <>
            <div className="flows-sidebar">
              <div className="flows-header">
                <h3>Recent Flows</h3>
                <span className="flows-count">{filteredFlows.length}</span>
              </div>
              
              <div className="flows-list">
                {filteredFlows.map((flow) => (
                  <div
                    key={flow.id}
                    className={`flow-item ${selectedFlow === flow.id ? 'active' : ''}`}
                    onClick={() => setSelectedFlow(flow.id)}
                  >
                    <div className="flow-header">
                      <h4 className="flow-title">{flow.title}</h4>
                      <span className={`flow-status ${flow.status}`}>
                        {flow.status === 'completed' ? '✓' : flow.status === 'in-progress' ? '⋯' : '⏸'}
                      </span>
                    </div>
                    <p className="flow-description">{flow.description}</p>
                    <div className="flow-meta">
                      <div className="flow-participants">
                        <Users size={12} />
                        <span>{flow.participants.length} participants</span>
                      </div>
                      <div className="flow-time">
                        <Calendar size={12} />
                        <span>{flow.startTime}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="conversation-panel">
              {selectedFlowData ? (
                <>
                  <div className="conversation-header">
                    <div className="conversation-info">
                      <h2>{selectedFlowData.title}</h2>
                      <p>{selectedFlowData.description}</p>
                    </div>
                    <div className="conversation-meta">
                      <span className="participant-count">
                        <Users size={16} />
                        {selectedFlowData.participants.length} agents
                      </span>
                      <span className="message-count">
                        <MessageSquare size={16} />
                        {selectedFlowData.messages.length} messages
                      </span>
                    </div>
                  </div>

                  <div className="messages-container">
                    {selectedFlowData.messages.length > 0 ? (
                      selectedFlowData.messages.map((message) => (
                        <div key={message.id} className="message-item">
                          <div className="message-avatar" style={{ backgroundColor: getAgentColor(message.type) }}>
                            {getAgentAvatar(message.agent)}
                          </div>
                          <div className="message-content">
                            <div className="message-header">
                              <span className="agent-name">{message.agent}</span>
                              <span className="agent-role">{message.role}</span>
                              <span className="message-time">{message.timestamp}</span>
                            </div>
                            <div className="message-text">
                              {message.content}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="empty-messages">
                        <MessageSquare size={48} />
                        <h3>No messages yet</h3>
                        <p>This collaboration is just getting started.</p>
                      </div>
                    )}
                  </div>

                  {selectedFlowData.status === 'completed' && (
                    <div className="conversation-footer">
                      <div className="input-container">
                        <input
                          type="text"
                          placeholder="Instruct the AI team or add more context..."
                          className="message-input"
                          disabled
                        />
                        <button className="send-button" disabled>
                          Send
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="no-selection">
                  <Clock size={64} />
                  <h3>Select a collaboration flow</h3>
                  <p>Choose from the list to view the conversation history</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="task-history-view">
            <div className="task-history-header">
              <h2>Task History</h2>
            </div>
            
            <div className="task-history-card">
              <div className="card-header">
                <h3>Recent Collaborations</h3>
              </div>
              
              <div className="task-table">
                <div className="table-header">
                  <div className="col-task-id">Task ID</div>
                  <div className="col-prompt">Prompt</div>
                  <div className="col-agents">Agents</div>
                  <div className="col-date">Date Initiated</div>
                  <div className="col-status">Status</div>
                  <div className="col-actions">Actions</div>
                </div>
                
                <div className="table-body">
                  {filteredTasks.map((task) => (
                    <div key={task.id} className="table-row">
                      <div className="col-task-id">
                        <span className="task-id">{task.id}</span>
                      </div>
                      <div className="col-prompt">
                        <span className="task-prompt">{task.prompt}</span>
                      </div>
                      <div className="col-agents">
                        <div className="agent-avatars">
                          {task.agents.map((agent, index) => (
                            <div key={index} className="agent-avatar-small">
                              {agent.charAt(0)}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="col-date">
                        <span className="task-date">{task.dateInitiated}</span>
                      </div>
                      <div className="col-status">
                        <span className={`status-badge ${task.status}`}>
                          {task.status === 'completed' && '✓ Completed'}
                          {task.status === 'pending' && '⋯ Pending'}
                          {task.status === 'failed' && '✗ Failed'}
                        </span>
                      </div>
                      <div className="col-actions">
                        <button className="action-btn">
                          <Eye size={16} />
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;