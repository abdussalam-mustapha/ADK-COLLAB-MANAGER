import { Brain } from 'lucide-react';

interface FooterProps {
  onGetStarted?: () => void;
}

export function Footer({ onGetStarted }: FooterProps) {
  const footerSections = {
    product: [
      { label: 'Pricing', href: '#' },
      { label: 'Features', href: '#' },
      { label: 'API', href: '#' },
      { label: 'Integrations', href: '#' }
    ],
    company: [
      { label: 'About', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Press', href: '#' },
      { label: 'Partners', href: '#' }
    ],
    resources: [
      { label: 'Blog', href: '#' },
      { label: 'Support', href: '#' },
      { label: 'Docs', href: '#' },
      { label: 'Legal', href: '#' }
    ]
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid" data-aos="fade-up">
          {/* Brand Section */}
          <div className="footer-brand" data-aos="fade-up" data-aos-delay="100">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Brain className="w-8 h-8" />
              <span className="footer-logo">ADK-COLLAB Manager</span>
            </div>
            <p className="footer-description">
              Transforming the future of work with AI agent collaboration.
            </p>
            <button 
              className="btn btn-primary" 
              style={{ marginTop: '1rem' }}
              onClick={onGetStarted}
            >
              Start Collaborating
            </button>
          </div>

          {/* Product Links */}
          <div data-aos="fade-up" data-aos-delay="200">
            <h4 className="footer-section-title">Product</h4>
            <ul className="footer-links">
              {footerSections.product.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="footer-link">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div data-aos="fade-up" data-aos-delay="300">
            <h4 className="footer-section-title">Company</h4>
            <ul className="footer-links">
              {footerSections.company.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="footer-link">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div data-aos="fade-up" data-aos-delay="400">
            <h4 className="footer-section-title">Resources</h4>
            <ul className="footer-links">
              {footerSections.resources.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="footer-link">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Ready to Elevate Section */}
          <div style={{ textAlign: 'center' }} data-aos="fade-up" data-aos-delay="500">
            <h4 className="footer-section-title">Ready to Elevate Your Team?</h4>
            <button 
              className="btn btn-primary"
              onClick={onGetStarted}
            >
              Start Collaborating
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © 2025 ADK-COLLAB Manager. All rights reserved.
          </p>
          <p className="footer-tagline">
            Built with AI collaboration in mind
          </p>
        </div>
      </div>
    </footer>
  );
}