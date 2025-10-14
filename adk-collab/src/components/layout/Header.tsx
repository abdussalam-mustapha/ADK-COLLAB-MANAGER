import { Brain } from 'lucide-react';

interface HeaderProps {
  onGetStarted?: () => void;
}

export function Header({ onGetStarted }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <a href="#" className="header-logo">
          <Brain className="w-8 h-8" />
          ADK-COLLAB Manager
        </a>
        
        {/* Navigation */}
        <nav className="header-nav">
          <a href="#" className="header-nav-link">
            Home
          </a>
          <a href="#features" className="header-nav-link">
            Features
          </a>
          <a href="#testimonials" className="header-nav-link">
            Testimonials
          </a>
          <a href="#contact" className="header-nav-link">
            Contact
          </a>
        </nav>
        
        {/* Actions */}
        <div className="header-actions">
          <button className="btn btn-ghost btn-sm">
            Log In
          </button>
          <button 
            className="btn btn-primary btn-sm"
            onClick={onGetStarted}
          >
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
}