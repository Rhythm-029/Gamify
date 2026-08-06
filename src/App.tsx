import { useState } from 'react';
import { BrainedOSDesktop } from './components/os/BrainedOSDesktop';
import { LandingPage } from './components/landing/LandingPage';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { TeamsCallIntro } from './components/intro/TeamsCallIntro';

export function App() {
  // Main view journey: 'landing' -> 'onboarding' -> 'workspace'
  const [viewMode, setViewMode] = useState<'landing' | 'onboarding' | 'teams_intro' | 'workspace'>('landing');
  const [playerConfig, setPlayerConfig] = useState<{
    name: string;
    role: string;
    company: string;
    email: string;
    linkedin: string;
  } | null>(null);

  const handleStartOnboarding = () => {
    setViewMode('onboarding');
  };

  const handleOnboardingComplete = (userConfig: any) => {
    setPlayerConfig(userConfig);
    setViewMode('workspace'); // Lands directly on Brained OS Desktop with clean boot
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
  return (
    <BrainedOSDesktop 
      playerConfig={playerConfig || undefined} 
      firstBoot={true} 
    />
  );
}

export default App;
