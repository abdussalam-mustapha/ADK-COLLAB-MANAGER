export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Alex Chen",
      role: "CTO, Tech Solutions Ltd",
      content: "ADK-COLLAB Manager revolutionized our development cycle. The AI agents are incredibly intuitive and collaborative seamlessly.",
      avatar: "👤"
    },
    {
      name: "Dr. Lee Gupta",
      role: "Lead Data Scientist & Rsh",
      content: "The adaptive learning capabilities are phenomenal. Our research insights have accelerated exponentially.",
      avatar: "👤"
    },
    {
      name: "Sam Miller",
      role: "Data Analyst, Digital Insights",
      content: "Data analysis is now effortlessly collaborative. ADK-COLLAB Manager agents surface insights I never thought possible.",
      avatar: "👤"
    }
  ];

  return (
    <section className="section section-dark" id="testimonials">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">
            What Our Customers Say
          </h2>
          <p className="section-description">
            Hear from leading innovators on how ADK-COLLAB Manager transformed their operations.
          </p>
        </div>
        
        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <p className="testimonial-content">
                "{testimonial.content}"
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '50%',
                  backgroundColor: 'var(--border-gray)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="testimonial-author">{testimonial.name}</p>
                  <p className="testimonial-role">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}