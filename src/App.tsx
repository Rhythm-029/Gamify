import { useState } from 'react';
import { BrainedOSDesktop } from './components/os/BrainedOSDesktop';
import { LandingPage } from './components/landing/LandingPage';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { FinalReportScreen } from './components/apps/FinalReportScreen';
import { GameProvider, useGame } from './context/GameContext';

// ── Inner app — reads GameContext for phase transitions ────────────────────────

function InnerApp({ playerConfig }: { playerConfig: any }) {
  const { state } = useGame();

  // Show Final Report fullscreen when phase is 'report'
  if (state.phase === 'report') {
    return (
      <FinalReportScreen
        onReturnToDashboard={() => {
          // Reset to landing for a new run
          window.location.reload();
        }}
      />
    );
  }

  return (
    <BrainedOSDesktop
      playerConfig={playerConfig}
      firstBoot={true}
    />
  );
}

// ── Evaluation bridge — transitions evaluating → report after delay ────────────

function EvaluationBridge({ playerConfig }: { playerConfig: any }) {
  const { state, setPhase } = useGame();

  // When phase switches to 'evaluating', wait 4s then go to report
  if (state.phase === 'evaluating') {
    setTimeout(() => setPhase('report'), 4000);
  }

  return <InnerApp playerConfig={playerConfig} />;
}

// ── Root App ───────────────────────────────────────────────────────────────────

export function App() {
  const [viewMode, setViewMode] = useState<'landing' | 'onboarding' | 'workspace'>('landing');
  const [playerConfig, setPlayerConfig] = useState<{
    name: string; role: string; company: string; email: string; linkedin: string;
  } | null>(null);

  const handleStartOnboarding = () => setViewMode('onboarding');

  const handleOnboardingComplete = (userConfig: any) => {
    setPlayerConfig(userConfig);

    // Create game session on backend (non-blocking)
    if (userConfig?.email) {
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/game/session/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_name: userConfig.name,
          player_email: userConfig.email,
          player_company: userConfig.company,
          player_role: userConfig.role,
          scenario_id: 'titan_hr_portal',
        }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data?.session_id) {
            localStorage.setItem('brained_session_id', data.session_id);
          }
        })
        .catch(() => {
          // Offline — local session ID
          const localId = `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
          localStorage.setItem('brained_session_id', localId);
        });
    }

    setViewMode('workspace');
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

  // Workspace — wrapped in GameProvider
  return (
    <GameProvider>
      <EvaluationBridge playerConfig={playerConfig} />
    </GameProvider>
  );
}

export default App;
