import { useState } from 'react';
import './Dashboard.css';
import { AgentsPage } from './AgentsPage';
import HistoryPage from './HistoryPage';
import SettingsPage from './SettingsPage';
import { useCollaboration, useBackendHealth, useAgents } from '../hooks/useApi';
import { apiClient } from '../services/api';
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
  Brain,
  Copy,
  Check,
  X
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
  const [copiedContent, setCopiedContent] = useState<string | null>(null);
  
  // Modal states for new agent and task creation
  const [showNewAgentModal, setShowNewAgentModal] = useState(false);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  
  // Form states
  const [newAgentForm, setNewAgentForm] = useState({
    name: '',
    description: '',
    role: '',
    capabilities: '',
    model: 'gpt-oss:120b-cloud'
  });
  
  const [newTaskForm, setNewTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    agents: [] as string[]
  });

  // Backend integration
  const { 
    currentTask: liveTask, 
    isLoading: collaborationLoading, 
    error: collaborationError,
    startCollaboration 
  } = useCollaboration();
  
  const { isHealthy: backendHealthy } = useBackendHealth();
  
  // Agent management
  const { agents: availableAgents, fetchAgents } = useAgents();

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

  // Helper function to extract readable content from agent results
  const extractContent = (result: any): string => {
    if (!result) return 'No content available';
    
    // Helper function to extract content from JSON code blocks
    const extractFromCodeBlock = (text: string): string => {
      if (typeof text !== 'string') return text;
      
      // Remove JSON code block markers
      const codeBlockRegex = /```json\s*([\s\S]*?)\s*```/;
      const match = text.match(codeBlockRegex);
      
      if (match) {
        try {
          const jsonContent = JSON.parse(match[1]);
          return formatJsonToText(jsonContent);
        } catch (e) {
          // If JSON parsing fails, return the raw content without code blocks
          return match[1];
        }
      }
      
      return text;
    };
    
    // Helper function to convert JSON to readable text
    const formatJsonToText = (obj: any, indent: string = ''): string => {
      if (typeof obj === 'string') return extractFromCodeBlock(obj);
      if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj);
      if (Array.isArray(obj)) {
        return obj.map((item) => `${indent}• ${formatJsonToText(item, indent + '  ')}`).join('\n');
      }
      if (typeof obj === 'object' && obj !== null) {
        return Object.entries(obj)
          .filter(([key]) => !['agent', 'timestamp', 'session', 'id', 'type', 'status', 'generated_at'].includes(key.toLowerCase()))
          .map(([key, value]) => {
            const formattedKey = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').replace(/_/g, ' ');
            const formattedValue = formatJsonToText(value, indent + '  ');
            return `${indent}**${formattedKey}:**\n${indent}${formattedValue}`;
          }).join('\n\n');
      }
      return String(obj);
    };
    
    // First try to extract string content and check for code blocks
    if (typeof result === 'string') {
      return extractFromCodeBlock(result);
    }
    
    // Handle the specific agent response format from the API
    if (typeof result === 'object') {
      // For ResearchAgent responses - check findings field
      if (result.findings) {
        return extractFromCodeBlock(result.findings);
      }
      
      // For WriterAgent responses - check final_article field  
      if (result.final_article) {
        return result.final_article;
      }
      
      // For PlannerAgent responses - check task_analysis field
      if (result.task_analysis) {
        return extractFromCodeBlock(result.task_analysis);
      }
      
      // For ReviewerAgent responses - multiple possible fields
      if (result.review_report) {
        return formatJsonToText(result.review_report);
      }
      
      // Standard result processing for other response types
      if (result.content) return extractFromCodeBlock(result.content);
      if (result.strategy) return extractFromCodeBlock(result.strategy);
      if (result.plan) return extractFromCodeBlock(result.plan);
      if (result.feedback) return extractFromCodeBlock(result.feedback);
      if (result.review) return formatJsonToText(result.review);
      if (result.summary) return result.summary;
      if (result.text) return extractFromCodeBlock(result.text);
      if (result.description) return result.description;
      if (result.analysis) return extractFromCodeBlock(result.analysis);
      if (result.report) return formatJsonToText(result.report);
      if (result.output) return result.output;
      if (result.result) return extractFromCodeBlock(result.result);
      
      // If it's a complex object, format it nicely
      return formatJsonToText(result);
    }
    
    return 'Content processing completed successfully';
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

  // Handle copy content functionality
  const handleCopyContent = async (content: string, agentType: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedContent(agentType);
      setTimeout(() => setCopiedContent(null), 2000); // Reset after 2 seconds
    } catch (error) {
      console.error('Failed to copy content:', error);
    }
  };

  // Handle new agent creation
  const handleCreateAgent = async () => {
    try {
      const capabilities = newAgentForm.capabilities.split(',').map(c => c.trim()).filter(c => c);
      
      const response = await apiClient.createAgent({
        name: newAgentForm.name,
        description: newAgentForm.description,
        role: newAgentForm.role,
        capabilities,
        model: newAgentForm.model
      });

      if (response.success) {
        setShowNewAgentModal(false);
        setNewAgentForm({
          name: '',
          description: '',
          role: '',
          capabilities: '',
          model: 'gpt-oss:120b-cloud'
        });
        
        // Refresh agents list
        fetchAgents();
        
        console.log('Agent created successfully:', response.agent);
      }
    } catch (error) {
      console.error('Failed to create agent:', error);
    }
  };

  // Handle new task creation
  const handleCreateTask = async () => {
    try {
      await startCollaboration({
        task: `${newTaskForm.title}: ${newTaskForm.description}`,
        agents: newTaskForm.agents.length > 0 ? newTaskForm.agents : ['researcher', 'writer', 'reviewer']
      });
      
      setShowNewTaskModal(false);
      setNewTaskForm({
        title: '',
        description: '',
        priority: 'medium',
        agents: []
      });
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const recentActivity: AgentActivity[] = liveTask?.conversation_history && liveTask.conversation_history.length > 0 
    ? liveTask.conversation_history.slice(-3).map((msg: any, index: number) => ({
        id: `live-${index}`,
        agentName: msg.agent || 'Unknown Agent',
        agentRole: getAgentRole(msg.agent),
        action: getActionFromAgent(msg.agent),
        description: extractContent(msg.result),
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
            <Brain className="logo-icon" />
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
                {backendHealthy ? 'Agent Connected' : 'Agent Offline'}
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
            <button 
              className="btn btn-secondary"
              onClick={() => setShowNewAgentModal(true)}
            >
              <UserPlus className="w-4 h-4" />
              New Agent
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => setShowNewTaskModal(true)}
            >
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
                  <strong>Agent Connected!</strong> Real-time collaboration active.
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
                                  <div className="agent-output-header">
                                    <h4>📋 Planning Phase</h4>
                                    <button 
                                      className="copy-btn"
                                      onClick={() => handleCopyContent(extractContent(liveTask.results?.planning), 'planning')}
                                      title="Copy planning content"
                                    >
                                      {copiedContent === 'planning' ? (
                                        <Check className="w-4 h-4 text-green-500" />
                                      ) : (
                                        <Copy className="w-4 h-4" />
                                      )}
                                    </button>
                                  </div>
                                  <div className="output-content">
                                    {extractContent(liveTask.results?.planning)}
                                  </div>
                                </div>
                              )}
                              
                              {liveTask.results.research && (
                                <div className="agent-output">
                                  <div className="agent-output-header">
                                    <h4>🔍 Research Findings</h4>
                                    <button 
                                      className="copy-btn"
                                      onClick={() => handleCopyContent(extractContent(liveTask.results?.research), 'research')}
                                      title="Copy research content"
                                    >
                                      {copiedContent === 'research' ? (
                                        <Check className="w-4 h-4 text-green-500" />
                                      ) : (
                                        <Copy className="w-4 h-4" />
                                      )}
                                    </button>
                                  </div>
                                  <div className="output-content">
                                    {extractContent(liveTask.results?.research)}
                                  </div>
                                </div>
                              )}
                              
                              {liveTask.results.writing && (
                                <div className="agent-output">
                                  <div className="agent-output-header">
                                    <h4>✍️ Written Content</h4>
                                    <button 
                                      className="copy-btn"
                                      onClick={() => handleCopyContent(extractContent(liveTask.results?.writing), 'writing')}
                                      title="Copy written content"
                                    >
                                      {copiedContent === 'writing' ? (
                                        <Check className="w-4 h-4 text-green-500" />
                                      ) : (
                                        <Copy className="w-4 h-4" />
                                      )}
                                    </button>
                                  </div>
                                  <div className="output-content">
                                    {extractContent(liveTask.results?.writing)}
                                  </div>
                                </div>
                              )}
                              
                              {liveTask.results.review && (
                                <div className="agent-output">
                                  <div className="agent-output-header">
                                    <h4>🔍 Quality Review</h4>
                                    <button 
                                      className="copy-btn"
                                      onClick={() => handleCopyContent(extractContent(liveTask.results?.review), 'review')}
                                      title="Copy review content"
                                    >
                                      {copiedContent === 'review' ? (
                                        <Check className="w-4 h-4 text-green-500" />
                                      ) : (
                                        <Copy className="w-4 h-4" />
                                      )}
                                    </button>
                                  </div>
                                  <div className="output-content">
                                    {extractContent(liveTask.results?.review)}
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
                                    <div className="timeline-info">
                                      <span className="agent-name">{msg.agent}</span>
                                      <span className="timestamp">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <button 
                                      className="copy-btn"
                                      onClick={() => handleCopyContent(extractContent(msg.result), `timeline-${index}`)}
                                      title={`Copy ${msg.agent} content`}
                                    >
                                      {copiedContent === `timeline-${index}` ? (
                                        <Check className="w-4 h-4 text-green-500" />
                                      ) : (
                                        <Copy className="w-4 h-4" />
                                      )}
                                    </button>
                                  </div>
                                  {msg.result && (
                                    <div className="timeline-content">
                                      {extractContent(msg.result)}
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

      {/* New Agent Modal */}
      {showNewAgentModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Create New Agent</h3>
              <button 
                className="modal-close"
                onClick={() => setShowNewAgentModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Agent Name</label>
                <input
                  type="text"
                  value={newAgentForm.name}
                  onChange={(e) => setNewAgentForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., AnalysisAgent"
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label>Role</label>
                <input
                  type="text"
                  value={newAgentForm.role}
                  onChange={(e) => setNewAgentForm(prev => ({ ...prev, role: e.target.value }))}
                  placeholder="e.g., Data Analysis Specialist"
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newAgentForm.description}
                  onChange={(e) => setNewAgentForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this agent does..."
                  className="form-textarea"
                  rows={3}
                />
              </div>
              
              <div className="form-group">
                <label>Capabilities (comma-separated)</label>
                <input
                  type="text"
                  value={newAgentForm.capabilities}
                  onChange={(e) => setNewAgentForm(prev => ({ ...prev, capabilities: e.target.value }))}
                  placeholder="e.g., data-analysis, visualization, reporting"
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label>Model</label>
                <select
                  value={newAgentForm.model}
                  onChange={(e) => setNewAgentForm(prev => ({ ...prev, model: e.target.value }))}
                  className="form-select"
                >
                  <option value="gpt-oss:120b-cloud">gpt-oss:120b-cloud</option>
                  <option value="llama2">llama2</option>
                  <option value="codellama">codellama</option>
                </select>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowNewAgentModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleCreateAgent}
                disabled={!newAgentForm.name || !newAgentForm.role || !newAgentForm.description}
              >
                Create Agent
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Task Modal */}
      {showNewTaskModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Create New Task</h3>
              <button 
                className="modal-close"
                onClick={() => setShowNewTaskModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Task Title</label>
                <input
                  type="text"
                  value={newTaskForm.title}
                  onChange={(e) => setNewTaskForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Market Research Analysis"
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label>Task Description</label>
                <textarea
                  value={newTaskForm.description}
                  onChange={(e) => setNewTaskForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the task in detail..."
                  className="form-textarea"
                  rows={4}
                />
              </div>
              
              <div className="form-group">
                <label>Priority</label>
                <select
                  value={newTaskForm.priority}
                  onChange={(e) => setNewTaskForm(prev => ({ ...prev, priority: e.target.value }))}
                  className="form-select"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Assign Agents (optional)</label>
                <div className="agent-checkboxes">
                  {availableAgents.map((agent) => (
                    <label key={agent.id} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={newTaskForm.agents.includes(agent.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewTaskForm(prev => ({ 
                              ...prev, 
                              agents: [...prev.agents, agent.id] 
                            }));
                          } else {
                            setNewTaskForm(prev => ({ 
                              ...prev, 
                              agents: prev.agents.filter(id => id !== agent.id) 
                            }));
                          }
                        }}
                      />
                      {agent.name}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowNewTaskModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleCreateTask}
                disabled={!newTaskForm.title || !newTaskForm.description}
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}