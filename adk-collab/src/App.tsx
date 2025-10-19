import { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HeroSection } from './components/sections/HeroSection';
import { FeaturesSection } from './components/sections/FeaturesSection';
import { CapabilitiesSection } from './components/sections/CapabilitiesSection';
import { TestimonialsSection } from './components/sections/TestimonialsSection';
import { Dashboard } from './components/Dashboard';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './App.css';

type View = 'landing' | 'dashboard';

function App() {
  const [currentView, setCurrentView] = useState<View>('landing');

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
      offset: 100
    });
  }, []);

  if (currentView === 'dashboard') {
    return <Dashboard />;
  }

  return (
    <div className="app">
      <Header onGetStarted={() => setCurrentView('dashboard')} />
      <main>
        <HeroSection onGetStarted={() => setCurrentView('dashboard')} />
        <FeaturesSection />
        <CapabilitiesSection />
        <TestimonialsSection />
      </main>
      <Footer onGetStarted={() => setCurrentView('dashboard')} />
    </div>
  );
}

export default App;
