import { useState, useEffect, useRef } from 'react';
import { BrainedOSDesktop } from './components/os/BrainedOSDesktop';
import { LandingPage } from './components/landing/LandingPage';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { FinalReportScreen } from './components/apps/FinalReportScreen';
import { CompletionScreen } from './components/landing/CompletionScreen';
import { GameProvider, useGame } from './context/GameContext';
import { ChapterSelectHub } from './components/os/ChapterSelectHub';
import { resetChapterStatuses } from './data/chaptersData';

// ── Inner app — reads GameContext for phase transitions ─────────────────────────

function InnerApp({
  playerConfig,
  activeChapter,
  onStartChapter,
  onCompletion,
  onReturnToChapterSelect,
}: {
  playerConfig: any;
  activeChapter?: number | null;
  onStartChapter?: (id: number) => void;
  onCompletion?: () => void;
  onReturnToChapterSelect?: () => void;
}) {
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
      activeChapter={activeChapter ?? 1}
      onStartChapter={onStartChapter}
      onReturnToChapterSelect={onReturnToChapterSelect}
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

type ViewMode = 'landing' | 'onboarding' | 'chapter_select' | 'workspace' | 'completion';
type ActiveChapter = number | null;

export function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('landing');
  const [playerConfig, setPlayerConfig] = useState<{
    name: string; role: string; company: string; email: string; linkedin: string;
  } | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(() => localStorage.getItem('brained_session_id'));
  const [activeChapter, setActiveChapter] = useState<ActiveChapter>(null);

  useEffect(() => {
    // Reset chapter progression to session start (Chapter 1 unlocked, 2-12 locked)
    resetChapterStatuses();
  }, []);

  const handleStartOnboarding = () => {
    resetChapterStatuses();
    setViewMode('onboarding');
  };

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

    // Go to chapter select instead of workspace directly
    setViewMode('chapter_select');
  };

  const handleStartChapter = (chapterId: number) => {
    setActiveChapter(chapterId);
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

  if (viewMode === 'chapter_select') {
    return (
      <ChapterSelectHub
        playerConfig={playerConfig}
        onStartChapter={handleStartChapter}
      />
    );
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
        activeChapter={activeChapter}
        onStartChapter={handleStartChapter}
        onCompletion={() => setViewMode('completion')}
        onReturnToChapterSelect={() => setViewMode('chapter_select')}
      />
    </GameProvider>
  );
}

// Watches for phase=report and routes to completion screen
function GamePhaseRouter({
  playerConfig,
  activeChapter,
  onStartChapter,
  onCompletion,
  onReturnToChapterSelect,
}: {
  playerConfig: any;
  activeChapter: number | null;
  onStartChapter: (id: number) => void;
  onCompletion: () => void;
  onReturnToChapterSelect: () => void;
}) {
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
    }
  }, [state.phase, onCompletion]);

  return (
    <InnerApp
      playerConfig={playerConfig}
      activeChapter={activeChapter}
      onStartChapter={onStartChapter}
      onCompletion={onCompletion}
      onReturnToChapterSelect={onReturnToChapterSelect}
    />
  );
}

export default App;
