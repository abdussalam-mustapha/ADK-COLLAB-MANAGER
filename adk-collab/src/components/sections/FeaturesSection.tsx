import { CircuitBoard, MessageSquare, TrendingUp } from 'lucide-react';

export function FeaturesSection() {
  const features = [
    {
      icon: <CircuitBoard className="w-8 h-8" />,
      title: "Intelligent Workflow Automation",
      description: "Automate complex tasks and decision-making processes with self-optimizing AI agents."
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Cross-Agent Communication", 
      description: "Agents communicate securely and efficiently, sharing insights and data in real-time."
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Adaptive Learning & Optimization",
      description: "Our AI agents continuously learn and adapt, improving performance and efficiency over time."
    }
  ];

  return (
    <section id="features" className="section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">
            Seamless AI Agent Collaboration
          </h2>
          <p className="section-description">
            Empower your workflows with intelligent agents working in perfect harmony.
          </p>
        </div>
        
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-card-icon">
                {feature.icon}
              </div>
              <h3 className="feature-card-title">{feature.title}</h3>
              <p className="feature-card-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}