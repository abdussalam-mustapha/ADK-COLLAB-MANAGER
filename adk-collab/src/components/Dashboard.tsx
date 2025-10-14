import { useState } from 'react';
import './Dashboard.css';
import { AgentsPage } from './AgentsPage';
import HistoryPage from './HistoryPage';
import SettingsPage from './SettingsPage';
import { useCollaboration, useBackendHealth } from '../hooks/useApi';
import { 
  LayoutDashboard, 
  Users, 
  History, 
  Settings, 
  Search,
  UserPlus,
  Plus,
  Send,
  ChevronDown,
  FileEdit,
  Eye,
  Zap
} from 'lucide-react';

interface AgentActivity {
  id: string;
  agentName: string;
  agentRole: string;
  action: string;
  description: string;
  timestamp: string;
  avatar: string;
}

export function Dashboard() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [taskInput, setTaskInput] = useState('');
  const [showTaskSummary, setShowTaskSummary] = useState(true);
  const [showFinalOutput, setShowFinalOutput] = useState(false);

  // Backend integration
  const { 
    currentTask: liveTask, 
    isLoading: collaborationLoading, 
    error: collaborationError,
    startCollaboration 
  } = useCollaboration();
  
  const { isHealthy: backendHealthy } = useBackendHealth();

  // Helper functions for agent mapping
  const getAgentRole = (agentName: string): string => {
    switch (agentName?.toLowerCase()) {
      case 'planneragent': return 'Strategic Planning & Coordination';
      case 'researchagent': return 'Information Retrieval & Analysis';
      case 'writeragent': return 'Content Generation & Synthesis';
      case 'revieweragent': return 'Quality Assurance & Refinement';
      default: return 'AI Assistant';
    }
  };

  const getActionFromAgent = (agentName: string): string => {
    switch (agentName?.toLowerCase()) {
      case 'planneragent': return 'Strategic Planning';
      case 'researchagent': return 'Research & Analysis';
      case 'writeragent': return 'Content Creation';
      case 'revieweragent': return 'Quality Review';
      default: return 'Processing';
    }
  };

  const getAvatarFromAgent = (agentName: string): string => {
    switch (agentName?.toLowerCase()) {
      case 'planneragent': return 'user';
      case 'researchagent': return 'search';
      case 'writeragent': return 'edit';
      case 'revieweragent': return 'eye';
      default: return 'user';
    }
  };

  // Handle task submission
  const handleTaskSubmit = async () => {
    if (!taskInput.trim()) return;
    
    try {
      await startCollaboration({
        task: taskInput,
        agents: ['researcher', 'writer', 'reviewer'] // Default agents
      });
      setTaskInput(''); // Clear input on success
    } catch (error) {
      console.error('Failed to start collaboration:', error);
    }
  };

  const recentActivity: AgentActivity[] = liveTask?.conversation_history && liveTask.conversation_history.length > 0 
    ? liveTask.conversation_history.slice(-3).map((msg: any, index: number) => ({
        id: `live-${index}`,
        agentName: msg.agent || 'Unknown Agent',
        agentRole: getAgentRole(msg.agent),
        action: getActionFromAgent(msg.agent),
        description: typeof msg.result === 'string' 
          ? msg.result 
          : (msg.result as any)?.findings || (msg.result as any)?.content || (msg.result as any)?.strategy || 'Processing...',
        timestamp: new Date(msg.timestamp).toLocaleTimeString(),
        avatar: getAvatarFromAgent(msg.agent)
      }))
    : [
      {
        id: '1',
        agentName: 'Researcher',
        agentRole: 'Information Retrieval & Analysis',
        action: 'Data Collection',
        description: backendHealthy ? 'Ready to process research requests' : 'Initiating a comprehensive search for \'Ollama local AI\' and \'ADK-TS integration benchmarks\'. Focusing on recent publications and open-source projects.',
        timestamp: '10:30 AM',
        avatar: 'search'
      },
      {
        id: '2',
        agentName: 'Writer',
        agentRole: 'Content Generation & Synthesis',
        action: 'Report Structure',
        description: backendHealthy ? 'Standing by for content creation tasks' : 'Received initial findings from Researcher. Beginning to structure the report outline: Introduction, Ollama Overview, ADK-TS Capabilities, Integration Benefits, and Future Prospects.',
        timestamp: '10:35 AM',
        avatar: 'edit'
      },
      {
        id: '3',
        agentName: 'Reviewer',
        agentRole: 'Quality Assurance & Refinement',
        action: 'Progress Monitoring',
        description: collaborationError ? 'Backend connection issue detected' : 'Monitoring for quality assurance opportunities',
        timestamp: '10:40 AM',
        avatar: 'eye'
      }
    ];

  const taskSummary = liveTask 
    ? `***Task ID:*** ${liveTask.taskId} ***Status:*** ${liveTask.status} ***Agents:*** ${liveTask.agents.join(', ')} ***Messages:*** ${liveTask.messages.length} agent interactions recorded.`
    : `***Task Goal:*** Generate a comprehensive report on integrating Ollama's local AI capabilities with ADK-TS for efficient AI agent collaboration. ***Key Agents:*** Researcher (data collection), Writer (content generation), Reviewer (quality assurance). ***Current Status:*** ${backendHealthy ? 'Ready for collaboration' : 'Backend offline - using demo mode'}. ***Connection:*** ${backendHealthy ? 'Connected to ADK-TS backend' : 'Disconnected - check backend server'}.`;

  const finalOutput = liveTask?.final_output ? liveTask.final_output.summary : null;

  const getAgentIcon = (iconType: string) => {
    switch (iconType) {
      case 'search':
        return <Search className="w-5 h-5" />;
      case 'edit':
        return <FileEdit className="w-5 h-5" />;
      case 'eye':
        return <Eye className="w-5 h-5" />;
      default:
        return <Users className="w-5 h-5" />;
    }
  };

  const sidebarItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'agents', icon: Users, label: 'Agents' },
    { id: 'history', icon: History, label: 'History' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Zap className="logo-icon" />
            <span className="logo-text">logo</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              className={`sidebar-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              <item.icon className="sidebar-icon" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-links">
            <a href="#" className="footer-link">Resources</a>
            <a href="#" className="footer-link">Legal</a>
            <a href="#" className="footer-link">Support</a>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Top Header */}
        <header className="dashboard-header">
          <nav className="header-nav">
            <button 
              className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveSection('dashboard')}
            >
              Dashboard
            </button>
            <button 
              className={`nav-item ${activeSection === 'agents' ? 'active' : ''}`}
              onClick={() => setActiveSection('agents')}
            >
              Agents
            </button>
            <button 
              className={`nav-item ${activeSection === 'history' ? 'active' : ''}`}
              onClick={() => setActiveSection('history')}
            >
              History
            </button>
            <button 
              className={`nav-item ${activeSection === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveSection('settings')}
            >
              Settings
            </button>
          </nav>

          <div className="header-actions">
            <div className="backend-status">
              <div className={`status-indicator ${backendHealthy ? 'healthy' : 'unhealthy'}`}>
                <div className="status-dot"></div>
                {backendHealthy ? 'Backend Connected' : 'Backend Offline'}
              </div>
            </div>
            <div className="search-container">
              <Search className="search-icon" />
              <input 
                type="text" 
                placeholder="Search tasks or agents..." 
                className="search-input"
              />
            </div>
            <button className="btn btn-secondary">
              <UserPlus className="w-4 h-4" />
              New Agent
            </button>
            <button className="btn btn-primary">
              <Plus className="w-4 h-4" />
              New Task
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="dashboard-content">
          {collaborationError && (
            <div className="error-banner">
              <div className="error-content">
                <span className="error-icon">⚠️</span>
                <div className="error-text">
                  <strong>Backend Connection Issue:</strong> {collaborationError}
                  <br />
                  <small>Please ensure the backend server is running on http://localhost:5000</small>
                </div>
              </div>
            </div>
          )}
          
          {backendHealthy && !collaborationError && liveTask && (
            <div className="success-banner">
              <div className="success-content">
                <span className="success-icon">✅</span>
                <div className="success-text">
                  <strong>Backend Connected!</strong> Real-time collaboration active.
                  <br />
                  <small>Current task: {liveTask.taskId}</small>
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 'agents' ? (
            <AgentsPage />
          ) : activeSection === 'history' ? (
            <HistoryPage />
          ) : activeSection === 'settings' ? (
            <SettingsPage />
          ) : (
            <div className="content-grid">
              {/* Left Column - Task Creation & Activity */}
              <div className="left-column">
                {/* Initiate New Task */}
                <section className="task-creation">
                  <h2 className="section-title">Initiate New Task</h2>
                  <p className="section-subtitle">What task should the team work on?</p>
                  
                  <div className="task-input-container">
                    <textarea
                      className="task-input"
                      placeholder="e.g., 'Research and write a report on the latest advancements in local AI, focusing on Ollama and ADK-TS integration.'"
                      value={taskInput}
                      onChange={(e) => setTaskInput(e.target.value)}
                      rows={4}
                    />
                    <button 
                      className="btn btn-primary send-btn"
                      onClick={handleTaskSubmit}
                      disabled={collaborationLoading || !taskInput.trim()}
                    >
                      <Send className="w-4 h-4" />
                      {collaborationLoading ? 'Starting...' : 'Send'}
                    </button>
                  </div>
                </section>

                {/* Recent Agent Activity */}
                <section className="agent-activity">
                  <h2 className="section-title">Recent Agent Activity</h2>
                  
                  <div className="activity-feed">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="activity-item">
                        <div className="activity-avatar">
                          {getAgentIcon(activity.avatar)}
                        </div>
                        <div className="activity-content">
                          <div className="activity-header">
                            <span className="agent-name">{activity.agentName}</span>
                            <span className="activity-time">{activity.timestamp}</span>
                          </div>
                          <div className="agent-role">{activity.agentRole}</div>
                          <div className="activity-action">{activity.action}</div>
                          <p className="activity-description">{activity.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Right Column - Task Summary & Output */}
              <div className="right-column">
                {/* Task Summary */}
                <section className="task-summary">
                  <div className="section-header">
                    <h2 className="section-title">Task Summary</h2>
                    <button 
                      className="collapse-btn"
                      onClick={() => setShowTaskSummary(!showTaskSummary)}
                    >
                      <ChevronDown className={`w-4 h-4 ${showTaskSummary ? '' : 'rotated'}`} />
                    </button>
                  </div>
                  
                  {showTaskSummary && (
                    <div className="task-summary-content">
                      <p>{taskSummary}</p>
                    </div>
                  )}
                </section>

                {/* Final Output */}
                <section className="final-output">
                  <div className="section-header">
                    <h2 className="section-title">Final Output</h2>
                    <button 
                      className="collapse-btn"
                      onClick={() => setShowFinalOutput(!showFinalOutput)}
                    >
                      <ChevronDown className={`w-4 h-4 ${showFinalOutput ? '' : 'rotated'}`} />
                    </button>
                  </div>
                  
                  {showFinalOutput && (
                    <div className="final-output-content">
                      {finalOutput ? (
                        <div className="collaboration-results">
                          <div className="result-summary">
                            <h3>Collaboration Summary</h3>
                            <p>{finalOutput}</p>
                          </div>
                          
                          {liveTask?.results && (
                            <div className="agent-outputs">
                              {liveTask.results.planning && (
                                <div className="agent-output">
                                  <h4>📋 Planning Phase</h4>
                                  <div className="output-content">
                                    {typeof liveTask.results.planning === 'string' 
                                      ? liveTask.results.planning 
                                      : (liveTask.results.planning as any).strategy || (liveTask.results.planning as any).plan || JSON.stringify(liveTask.results.planning, null, 2)
                                    }
                                  </div>
                                </div>
                              )}
                              
                              {liveTask.results.research && (
                                <div className="agent-output">
                                  <h4>🔍 Research Findings</h4>
                                  <div className="output-content">
                                    {typeof liveTask.results.research === 'string' 
                                      ? liveTask.results.research 
                                      : (liveTask.results.research as any).findings || (liveTask.results.research as any).summary || JSON.stringify(liveTask.results.research, null, 2)
                                    }
                                  </div>
                                </div>
                              )}
                              
                              {liveTask.results.writing && (
                                <div className="agent-output">
                                  <h4>✍️ Written Content</h4>
                                  <div className="output-content">
                                    {typeof liveTask.results.writing === 'string' 
                                      ? liveTask.results.writing 
                                      : (liveTask.results.writing as any).content || (liveTask.results.writing as any).text || JSON.stringify(liveTask.results.writing, null, 2)
                                    }
                                  </div>
                                </div>
                              )}
                              
                              {liveTask.results.review && (
                                <div className="agent-output">
                                  <h4>🔍 Quality Review</h4>
                                  <div className="output-content">
                                    {typeof liveTask.results.review === 'string' 
                                      ? liveTask.results.review 
                                      : (liveTask.results.review as any).feedback || (liveTask.results.review as any).review || JSON.stringify(liveTask.results.review, null, 2)
                                    }
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {liveTask?.conversation_history && liveTask.conversation_history.length > 0 && (
                            <div className="conversation-timeline">
                              <h3>Agent Conversation Timeline</h3>
                              {liveTask.conversation_history.map((msg: any, index: number) => (
                                <div key={index} className="timeline-item">
                                  <div className="timeline-header">
                                    <span className="agent-name">{msg.agent}</span>
                                    <span className="timestamp">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                                  </div>
                                  {msg.result && (
                                    <div className="timeline-content">
                                      {typeof msg.result === 'string' 
                                        ? msg.result 
                                        : (msg.result as any).findings || (msg.result as any).content || (msg.result as any).strategy || JSON.stringify(msg.result, null, 2)
                                      }
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p>Final report will be generated here once all agents complete their tasks...</p>
                      )}
                    </div>
                  )}
                </section>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}