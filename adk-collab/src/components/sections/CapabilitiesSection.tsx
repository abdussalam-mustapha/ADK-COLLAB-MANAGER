import { 
  GitBranch, 
  Lightbulb, 
  Target, 
  Users, 
  Shield, 
  BarChart3 
} from 'lucide-react';

export function CapabilitiesSection() {
  const capabilities = [
    {
      icon: <GitBranch className="w-8 h-8" />,
      title: "Dynamic Task Delegation",
      description: "Smart assignment tasks to specialized AI agents, ensuring optimal execution and resource allocation."
    },
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: "Real-time Insights Generation",
      description: "Get comprehensive, actionable insights from vast datasets, powered by collaborative AI analysis."
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Goal-Oriented AI Strategies",
      description: "Define objectives and let AI agents autonomously strategize and execute to achieve your targets."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Human-AI Co-creation",
      description: "Collaborate seamlessly with AI agents, blending human creativity with artificial intelligence efficiency."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure & Private Operations",
      description: "Your data and operations are protected with advanced encryption and secure agent protocols."
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Performance Analytics Dashboards",
      description: "Monitor AI agent performance and collaborative networks with intuitive real-time analytics."
    }
  ];

  return (
    <section className="section section-dark">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">
            Unlock Powerful Capabilities
          </h2>
          <p className="section-description">
            ADK-COLLAB Manager offers a suite of features designed to elevate your productivity and innovation.
          </p>
        </div>
        
        <div className="capabilities-grid">
          {capabilities.map((capability, index) => (
            <div key={index} className="feature-card">
              <div className="feature-card-icon">
                {capability.icon}
              </div>
              <h3 className="feature-card-title">{capability.title}</h3>
              <p className="feature-card-description">{capability.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}