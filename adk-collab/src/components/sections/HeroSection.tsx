import { ArrowRight, Brain } from 'lucide-react';

interface HeroSectionProps {
  onGetStarted?: () => void;
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <section className="hero-section">
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">
            ADK-COLLAB Manager
          </h1>
          <p className="hero-subtitle">
            Unleash the Power of AI Agent Collaboration.
          </p>
          
          <div className="hero-actions">
            <button 
              className="btn btn-primary btn-lg"
              onClick={onGetStarted}
            >
              Get Started
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
        
        <div className="hero-visual">
          {/* AI Brain Visual */}
          <div style={{
            width: '400px',
            height: '300px',
            backgroundColor: '#252525',
            borderRadius: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4)',
            backgroundSize: '400% 400%',
            animation: 'gradient 15s ease infinite'
          }}>
            <Brain className="w-24 h-24" style={{ color: 'white' }} />
            <style>
              {`
                @keyframes gradient {
                  0% { background-position: 0% 50%; }
                  50% { background-position: 100% 50%; }
                  100% { background-position: 0% 50%; }
                }
              `}
            </style>
          </div>
        </div>
      </div>
    </section>
  );
}