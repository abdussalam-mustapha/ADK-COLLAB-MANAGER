import { useState } from 'react';
import './AgentsPage.css';
import { useAgents } from '../hooks/useApi';
import { 
  Search, 
  FileEdit, 
  Eye, 
  Plus,
  Headphones,
  User
} from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  iconType: string;
}

export function AgentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Use real backend data
  const { agents: backendAgents, isLoading, error, updateAgentStatus } = useAgents();
  
  // Map backend agents to local format for compatibility
  const agents = backendAgents.map(agent => ({
    id: agent.id,
    name: agent.name,
    description: agent.role,
    status: agent.status === 'active' ? 'active' as const : 'inactive' as const,
    iconType: getIconTypeFromRole(agent.role)
  }));

  const handleToggleAgent = async (agentId: string) => {
    const agent = backendAgents.find(a => a.id === agentId);
    if (agent) {
      const newStatus = agent.status === 'active' ? 'idle' : 'active';
      await updateAgentStatus(agentId, newStatus);
    }
  };
  
  // Helper function to determine icon type from role
  function getIconTypeFromRole(role: string): string {
    if (role.toLowerCase().includes('research')) return 'search';
    if (role.toLowerCase().includes('writer') || role.toLowerCase().includes('content')) return 'edit';
    if (role.toLowerCase().includes('review') || role.toLowerCase().includes('quality')) return 'eye';
    if (role.toLowerCase().includes('assistant')) return 'headphones';
    return 'user';
  }

  const getAgentIcon = (iconType: string) => {
    switch (iconType) {
      case 'search':
        return <Search className="w-6 h-6" />;
      case 'edit':
        return <FileEdit className="w-6 h-6" />;
      case 'eye':
        return <Eye className="w-6 h-6" />;
      case 'headphones':
        return <Headphones className="w-6 h-6" />;
      default:
        return <User className="w-6 h-6" />;
    }
  };

  const toggleAgentStatus = (agentId: string) => {
    handleToggleAgent(agentId);
  };

  return (
    <div className="agents-page">
      <div className="agents-header">
        <h1 className="page-title">Agent Management</h1>
      </div>

      {/* Add New Agent Button */}
      <div className="add-agent-section">
        <button className="add-agent-btn">
          <Plus className="w-5 h-5" />
          Add New Agent
        </button>
      </div>

      {/* Agent Cards Grid */}
      <div className="agents-grid">
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading agents...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p className="error-message">{error}</p>
            <button onClick={() => window.location.reload()} className="retry-button">
              Retry
            </button>
          </div>
        ) : agents.length === 0 ? (
          <div className="empty-state">
            <p>No agents available. Please check your backend connection.</p>
          </div>
        ) : (
          agents.map((agent) => (
            <div key={agent.id} className="agent-card">
              <div className="agent-card-header">
                <div className="agent-icon">
                  {getAgentIcon(agent.iconType)}
                </div>
                <h3 className="agent-name">{agent.name}</h3>
              </div>
              
              <p className="agent-description">{agent.description}</p>
              
              <div className="agent-status-section">
                <span className={`status-label ${agent.status}`}>
                  Status: {agent.status === 'active' ? 'Active' : 'Inactive'}
                </span>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={agent.status === 'active'}
                    onChange={() => toggleAgentStatus(agent.id)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}