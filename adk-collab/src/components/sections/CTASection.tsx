import { ArrowRight, Sparkles } from 'lucide-react';
import { Container } from '../ui/Container';
import { Button } from '../ui/Button';

export function CTASection() {
  return (
    <section className="cta">
      <Container>
        <Sparkles className="cta-icon" />
        
        <h2>
          Ready to Transform Your Workflow?
        </h2>
        
        <p className="subtitle">
          Join thousands of teams using CollabMind to achieve breakthrough results with AI collaboration.
        </p>
        
        <div className="cta-buttons">
          <Button 
            variant="secondary" 
            size="lg"
            style={{ backgroundColor: 'white', color: '#2563eb' }}
          >
            Start Free Trial
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="lg"
            style={{ border: '1px solid white', color: 'white' }}
          >
            Schedule Demo
          </Button>
        </div>
        
        <p className="cta-note">
          No credit card required • 14-day free trial • Setup in minutes
        </p>
      </Container>
    </section>
  );
}