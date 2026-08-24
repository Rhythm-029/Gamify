import { useState, useEffect, useRef } from 'react';
import { BrainedOSDesktop } from './components/os/BrainedOSDesktop';
import { LandingPage } from './components/landing/LandingPage';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { FinalReportScreen } from './components/apps/FinalReportScreen';
import { CompletionScreen } from './components/landing/CompletionScreen';
import { GameProvider, useGame } from './context/GameContext';

// ── Inner app — reads GameContext for phase transitions ─────────────────────────

function InnerApp({ playerConfig, onCompletion }: { playerConfig: any; onCompletion?: () => void }) {
  const { state } = useGame();

  if (state.phase === 'report') {
    return (
      <FinalReportScreen
        onReturnToDashboard={() => {
          if (onCompletion) onCompletion();
          else window.location.reload();
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

// ── Evaluation bridge — transitions evaluating → report after delay ─────────────

function EvaluationBridge({ playerConfig, onCompletion }: { playerConfig: any; onCompletion?: () => void }) {
  const { state, setPhase } = useGame();

  // Fixed: moved to useEffect to prevent firing on every render (race condition)
  useEffect(() => {
    if (state.phase === 'evaluating') {
      const timer = setTimeout(() => setPhase('report'), 4000);
      return () => clearTimeout(timer);
    }
  }, [state.phase, setPhase]);

  return <InnerApp playerConfig={playerConfig} onCompletion={onCompletion} />;
}

// ── Root App ──────────────────────────────────────────────────────────────────

type ViewMode = 'landing' | 'onboarding' | 'workspace' | 'completion';

export function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('landing');
  const [playerConfig, setPlayerConfig] = useState<{
    name: string; role: string; company: string; email: string; linkedin: string;
  } | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(() => localStorage.getItem('brained_session_id'));

  const handleStartOnboarding = () => setViewMode('onboarding');

  const handleOnboardingComplete = (userConfig: any) => {
    setPlayerConfig(userConfig);

    // Persist player info for leaderboard
    if (userConfig?.name) {
      localStorage.setItem('brained_player_name', userConfig.name);
      localStorage.setItem('brained_player_company', userConfig.company || '');
      localStorage.setItem('brained_player_email', userConfig.email || '');
    }

    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:4000';

    fetch(`${apiBase}/api/game/session/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        player_name: userConfig.name,
        player_email: userConfig.email,
        player_company: userConfig.company,
        player_role: userConfig.role,
        scenario_id: 'titan_manufacturing_v1',
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.session_id) {
          localStorage.setItem('brained_session_id', data.session_id);
          setSessionId(data.session_id);
        }
      })
      .catch(() => {
        const localId = `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        localStorage.setItem('brained_session_id', localId);
        setSessionId(localId);
      });

    setViewMode('workspace');
  };

  if (viewMode === 'landing') {
    return (
      <LandingPage
        onStartOnboarding={handleStartOnboarding}
        onViewLeaderboard={() => {}}
        onViewCertificate={() => {}}
      />
    );
  }

  if (viewMode === 'onboarding') {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  if (viewMode === 'completion') {
    return (
      <CompletionScreen
        sessionId={sessionId}
        playerName={playerConfig?.name || localStorage.getItem('brained_player_name') || 'Consultant'}
        playerCompany={playerConfig?.company || localStorage.getItem('brained_player_company') || ''}
        onReturnToLanding={() => {
          localStorage.removeItem('brained_session_id');
          window.location.href = '/';
        }}
      />
    );
  }

  // Workspace — wrapped in GameProvider
  return (
    <GameProvider>
      <GamePhaseRouter
        playerConfig={playerConfig}
        onCompletion={() => setViewMode('completion')}
      />
    </GameProvider>
  );
}

// Watches for phase=report and routes to completion screen
function GamePhaseRouter({ playerConfig, onCompletion }: { playerConfig: any; onCompletion: () => void }) {
  const { state, setPhase } = useGame();
  const completionFiredRef = useRef(false);

  // Fix: use useEffect for evaluating → report transition
  useEffect(() => {
    if (state.phase === 'evaluating') {
      const timer = setTimeout(() => setPhase('report'), 4000);
      return () => clearTimeout(timer);
    }
  }, [state.phase, setPhase]);

  // Route to dedicated completion screen after final report phase
  useEffect(() => {
    if (state.phase === 'report' && !completionFiredRef.current) {
      // Allow FinalReportScreen to show first, transition on explicit user action
      // This is handled inside FinalReportScreen via onReturnToDashboard
    }
  }, [state.phase, onCompletion]);

  return <InnerApp playerConfig={playerConfig} onCompletion={onCompletion} />;
}

export default App;
