import { Brain, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  onGetStarted?: () => void;
}

export function Header({ onGetStarted }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <a href="#" className="header-logo">
          <Brain className="w-8 h-8" />
          ADK-COLLAB Manager
        </a>
        
        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        
        {/* Navigation */}
        <nav className={`header-nav ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
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
          
          {/* Mobile Actions */}
          <div className="mobile-actions">
            {/* <button className="btn btn-ghost btn-sm">
              Log In
            </button> */}
            <button 
              className="btn btn-primary btn-sm"
              onClick={onGetStarted}
            >
              Get Started
            </button>
          </div>
        </nav>
        
        {/* Desktop Actions */}
        <div className="header-actions">
          {/* <button className="btn btn-ghost btn-sm">
            Log In
          </button> */}
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