import React, { useState } from 'react';
import { Settings, Server, Palette, Users, ChevronDown, Save } from 'lucide-react';
import './SettingsPage.css';

interface OllamaConfig {
  model: string;
  serverUrl: string;
}

interface AppPreferences {
  themeMode: boolean; // true for dark, false for light
}

interface AgentDefaults {
  defaultDescription: string;
  autoActivateNewAgents: boolean;
}

const SettingsPage: React.FC = () => {
  const [ollamaConfig, setOllamaConfig] = useState<OllamaConfig>({
    model: 'llama3',
    serverUrl: 'http://localhost:11434'
  });

  const [appPreferences, setAppPreferences] = useState<AppPreferences>({
    themeMode: true // dark mode by default
  });

  const [agentDefaults, setAgentDefaults] = useState<AgentDefaults>({
    defaultDescription: 'A versatile AI agent focused on clear, concise communication, capable of adapting to various collaborative tasks.',
    autoActivateNewAgents: true
  });

  const [hasChanges, setHasChanges] = useState(false);

  const availableModels = [
    'llama3',
    'llama3:70b',
    'codellama',
    'mistral',
    'neural-chat',
    'vicuna',
    'gpt-oss:120b-cloud'
  ];

  const handleOllamaConfigChange = (field: keyof OllamaConfig, value: string) => {
    setOllamaConfig(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleAppPreferencesChange = (field: keyof AppPreferences, value: boolean) => {
    setAppPreferences(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleAgentDefaultsChange = (field: keyof AgentDefaults, value: string | boolean) => {
    setAgentDefaults(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSaveChanges = () => {
    // In a real app, this would save to backend/localStorage
    console.log('Saving settings:', { ollamaConfig, appPreferences, agentDefaults });
    setHasChanges(false);
    
    // Show success feedback (could be a toast notification)
    alert('Settings saved successfully!');
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div className="header-content">
          <h1 className="page-title">
            <Settings className="title-icon" />
            Settings
          </h1>
          <p className="page-description">
            Configure your ADK-COLLAB application and agent preferences
          </p>
        </div>
      </div>

      <div className="settings-content">
        {/* Ollama Configuration */}
        <section className="settings-section">
          <div className="section-header">
            <Server className="section-icon" />
            <div className="section-info">
              <h2 className="section-title">Ollama Configuration</h2>
              <p className="section-description">Configure your local AI model server details.</p>
            </div>
          </div>

          <div className="section-content">
            <div className="form-group">
              <label className="form-label">Ollama Model</label>
              <p className="form-help">Select the AI model to use for agent interactions.</p>
              <div className="select-container">
                <select
                  className="form-select"
                  value={ollamaConfig.model}
                  onChange={(e) => handleOllamaConfigChange('model', e.target.value)}
                >
                  {availableModels.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
                <ChevronDown className="select-icon" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Local Server URL</label>
              <p className="form-help">The URL where your Ollama server is running locally.</p>
              <input
                type="text"
                className="form-input"
                value={ollamaConfig.serverUrl}
                onChange={(e) => handleOllamaConfigChange('serverUrl', e.target.value)}
                placeholder="http://localhost:11434"
              />
            </div>
          </div>
        </section>

        {/* Application Preferences */}
        <section className="settings-section">
          <div className="section-header">
            <Palette className="section-icon" />
            <div className="section-info">
              <h2 className="section-title">Application Preferences</h2>
              <p className="section-description">Customize the look and feel of your CollabMind application.</p>
            </div>
          </div>

          <div className="section-content">
            <div className="form-group">
              <div className="toggle-group">
                <div className="toggle-info">
                  <label className="form-label">Theme Mode</label>
                  <p className="form-help">Switch between dark and light themes.</p>
                </div>
                <div className="toggle-container">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={appPreferences.themeMode}
                      onChange={(e) => handleAppPreferencesChange('themeMode', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Agent Defaults */}
        <section className="settings-section">
          <div className="section-header">
            <Users className="section-icon" />
            <div className="section-info">
              <h2 className="section-title">Agent Defaults</h2>
              <p className="section-description">Set default behaviors and characteristics for new AI agents.</p>
            </div>
          </div>

          <div className="section-content">
            <div className="form-group">
              <label className="form-label">Default Agent Description</label>
              <p className="form-help">A versatile AI agent focused on clear, concise communication, capable of adapting to various collaborative tasks.</p>
              <textarea
                className="form-textarea"
                value={agentDefaults.defaultDescription}
                onChange={(e) => handleAgentDefaultsChange('defaultDescription', e.target.value)}
                rows={4}
                placeholder="Enter default agent description..."
              />
            </div>

            <div className="form-group">
              <div className="toggle-group">
                <div className="toggle-info">
                  <label className="form-label">Auto-activate New Agents</label>
                  <p className="form-help">Automatically activate newly added agents upon creation.</p>
                </div>
                <div className="toggle-container">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={agentDefaults.autoActivateNewAgents}
                      onChange={(e) => handleAgentDefaultsChange('autoActivateNewAgents', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Save Button */}
        <div className="settings-footer">
          <button 
            className={`save-button ${hasChanges ? 'has-changes' : ''}`}
            onClick={handleSaveChanges}
            disabled={!hasChanges}
          >
            <Save size={16} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;