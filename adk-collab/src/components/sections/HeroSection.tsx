import { ArrowRight } from 'lucide-react';
import collabImage from '../../assets/collab-image.jpg';

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
          <img 
            src={collabImage} 
            alt="AI Agent Collaboration" 
            className="hero-image"
          />
        </div>
      </div>
    </section>
  );
}