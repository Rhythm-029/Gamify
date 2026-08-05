import { useState } from 'react';
import { BrainedOSDesktop } from './components/os/BrainedOSDesktop';
import { LandingPage } from './components/landing/LandingPage';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { TeamsCallIntro } from './components/intro/TeamsCallIntro';

export function App() {
  // Main view journey: 'landing' -> 'onboarding' -> 'teams_intro' -> 'workspace'
  const [viewMode, setViewMode] = useState<'landing' | 'onboarding' | 'teams_intro' | 'workspace'>('landing');

  const handleStartOnboarding = () => {
    setViewMode('onboarding');
  };

  const handleOnboardingComplete = () => {
    setViewMode('workspace'); // Lands directly on Brained OS Desktop!
  };

  if (viewMode === 'landing') {
    return (
      <LandingPage
        onStartOnboarding={handleStartOnboarding}
        onViewLeaderboard={() => setViewMode('workspace')}
        onViewCertificate={() => setViewMode('workspace')}
      />
    );
  }

  if (viewMode === 'onboarding') {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  if (viewMode === 'teams_intro') {
    return <TeamsCallIntro onJoinMeetingComplete={() => setViewMode('workspace')} />;
  }

  // BRAINED OS DESKTOP SIMULATOR WORKSTATION
  return <BrainedOSDesktop onOpenEventModal={() => {}} />;
}

export default App;
