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

interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  status: 'active' | 'idle' | 'working';
  avatar: string;
  lastActivity?: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  agents: string[];
  progress: number;
  createdAt: string;
}

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

  const recentActivity: AgentActivity[] = [
    {
      id: '1',
      agentName: 'Researcher',
      agentRole: 'Information Retrieval & Analysis',
      action: 'Data Collection',
      description: liveTask ? 'Working on: ' + liveTask.status : 'Initiating a comprehensive search for \'Ollama local AI\' and \'ADK-TS integration benchmarks\'. Focusing on recent publications and open-source projects.',
      timestamp: '10:30 AM',
      avatar: 'search'
    },
    {
      id: '2',
      agentName: 'Writer',
      agentRole: 'Content Generation & Synthesis',
      action: 'Report Structure',
      description: liveTask ? `Processing task: ${liveTask.taskId}` : 'Received initial findings from Researcher. Beginning to structure the report outline: Introduction, Ollama Overview, ADK-TS Capabilities, Integration Benefits, and Future Prospects.',
      timestamp: '10:35 AM',
      avatar: 'edit'
    },
    {
      id: '3',
      agentName: 'Reviewer',
      agentRole: 'Quality Assurance & Refinement',
      action: 'Progress Monitoring',
      description: collaborationError ? 'Backend connection issue detected' : 'Monitoring Writer\'s progress and Researcher\'s ongoing data collection. Will conduct an initial review for technical accuracy and best practice considerations.',
      timestamp: '10:40 AM',
      avatar: 'eye'
    }
  ];

  const taskSummary = liveTask 
    ? `***Task ID:*** ${liveTask.taskId} ***Status:*** ${liveTask.status} ***Agents:*** ${liveTask.agents.join(', ')} ***Messages:*** ${liveTask.messages.length} agent interactions recorded.`
    : `***Task Goal:*** Generate a comprehensive report on integrating Ollama's local AI capabilities with ADK-TS for efficient AI agent collaboration. ***Key Agents:*** Researcher (data collection), Writer (content generation), Reviewer (quality assurance). ***Current Status:*** ${backendHealthy ? 'Ready for collaboration' : 'Backend offline - using demo mode'}. ***Connection:*** ${backendHealthy ? 'Connected to ADK-TS backend' : 'Disconnected - check backend server'}.`;

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
                      <p>Final report will be generated here once all agents complete their tasks...</p>
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