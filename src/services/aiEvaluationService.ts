/**
 * aiEvaluationService.ts
 * Frontend Client for Grok AI Evaluation across Chapters 1 to 7+
 */

export interface UnifiedChapterScorecard {
  chapterId: number;
  totalScore: number;
  scheduleScore: number;
  riskScore: number;
  governanceScore: number;
  efficiencyScore: number;
  outcomeType: 'strong' | 'mixed' | 'incomplete';
  outcomeTitle: string;
  outcomeText: string;
  evaluatorName: string;
  evaluatorRole: string;
  executiveSummary: string;
  strengths: string[];
  improvements: string[];
  whatYouDidWell?: string[];
  whatToImprove?: string[];
  leadershipCoaching: string;
  personalizedTakeaway?: string;
  keyTakeaway?: string;
  explanations: {
    schedule: string;
    risk: string;
    governance: string;
    efficiency: string;
  };
  aiEvaluated: boolean;
  modelUsed?: string;
  evaluatedAt: string;
}

export async function requestChapterAIEvaluation(
  chapterId: number,
  state: any,
  fallbackScorecard?: Partial<UnifiedChapterScorecard>
): Promise<UnifiedChapterScorecard> {
  // Check if player profile exists
  let playerName = 'Digital Transformation Consultant';
  let playerRole = 'Lead Consultant';
  try {
    const storedUser = localStorage.getItem('brained_user_profile');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      if (parsed.name) playerName = parsed.name;
      if (parsed.role) playerRole = parsed.role;
    }
  } catch (e) {
    // ignore
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch('/api/game/evaluate/chapter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chapterId,
        state,
        playerContext: {
          name: playerName,
          role: playerRole,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data?.scorecard) {
        const sc = data.scorecard as UnifiedChapterScorecard;
        // Cache in localStorage
        try {
          localStorage.setItem(`brained_scorecard_ch${chapterId}`, JSON.stringify(sc));
        } catch (e) {
          // ignore
        }
        return sc;
      }
    }
  } catch (err) {
    console.warn(`[AI EVALUATION] Backend AI evaluation request failed or timed out for Chapter ${chapterId}. Using local evaluation fallback:`, err);
  } finally {
    clearTimeout(timeoutId);
  }

  // Fallback construction
  const now = new Date().toISOString();
  const schedule = fallbackScorecard?.scheduleScore ?? 85;
  const risk = fallbackScorecard?.riskScore ?? 85;
  const gov = fallbackScorecard?.governanceScore ?? 85;
  const eff = fallbackScorecard?.efficiencyScore ?? 85;
  const total = fallbackScorecard?.totalScore ?? Math.round((schedule + risk + gov + eff) / 4);

  const outcomeType = total >= 85 ? 'strong' : total >= 70 ? 'mixed' : 'incomplete';
  const strengths = fallbackScorecard?.strengths || fallbackScorecard?.whatYouDidWell || [
    'Maintained structured project governance',
    'Demonstrated balanced delivery trade-offs',
  ];
  const improvements = fallbackScorecard?.improvements || fallbackScorecard?.whatToImprove || [
    'Reinforce formal risk gates earlier in planning cycles',
  ];

  const defaultScorecard: UnifiedChapterScorecard = {
    chapterId,
    totalScore: total,
    scheduleScore: schedule,
    riskScore: risk,
    governanceScore: gov,
    efficiencyScore: eff,
    outcomeType: fallbackScorecard?.outcomeType || outcomeType,
    outcomeTitle:
      fallbackScorecard?.outcomeTitle ||
      (outcomeType === 'strong'
        ? 'EXEMPLARY DELIVERY GOVERNANCE'
        : outcomeType === 'mixed'
        ? 'BALANCED RESOLUTION WITH OPERATIONAL DEBT'
        : 'CRITICAL PREREQUISITES UNVERIFIED'),
    outcomeText:
      fallbackScorecard?.outcomeText ||
      fallbackScorecard?.executiveSummary ||
      'Executive review completed. Solid execution of core chapter objectives.',
    evaluatorName: fallbackScorecard?.evaluatorName || 'Executive Delivery Board',
    evaluatorRole: fallbackScorecard?.evaluatorRole || 'Practice Leadership',
    executiveSummary:
      fallbackScorecard?.executiveSummary ||
      fallbackScorecard?.outcomeText ||
      'Evaluation completed. Balanced technical readiness against business constraints.',
    strengths,
    improvements,
    whatYouDidWell: strengths,
    whatToImprove: improvements,
    leadershipCoaching:
      fallbackScorecard?.leadershipCoaching ||
      fallbackScorecard?.personalizedTakeaway ||
      'In digital transformation, true velocity comes from setting uncompromised technical foundations before accelerating.',
    personalizedTakeaway:
      fallbackScorecard?.personalizedTakeaway ||
      fallbackScorecard?.leadershipCoaching ||
      'In digital transformation, true velocity comes from setting uncompromised technical foundations before accelerating.',
    keyTakeaway:
      fallbackScorecard?.keyTakeaway ||
      fallbackScorecard?.leadershipCoaching ||
      'In digital transformation, true velocity comes from setting uncompromised technical foundations before accelerating.',
    explanations: {
      schedule: fallbackScorecard?.explanations?.schedule || `Schedule maintained at ${schedule}%.`,
      risk: fallbackScorecard?.explanations?.risk || `Risk managed at ${risk}%.`,
      governance: fallbackScorecard?.explanations?.governance || `Governance score calibrated at ${gov}%.`,
      efficiency: fallbackScorecard?.explanations?.efficiency || `Engineering velocity rated at ${eff}%.`,
    },
    aiEvaluated: false,
    evaluatedAt: now,
  };

  try {
    localStorage.setItem(`brained_scorecard_ch${chapterId}`, JSON.stringify(defaultScorecard));
  } catch (e) {
    // ignore
  }

  return defaultScorecard;
}

export function getSavedChapterScorecard(chapterId: number): UnifiedChapterScorecard | null {
  try {
    const raw = localStorage.getItem(`brained_scorecard_ch${chapterId}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore
  }
  return null;
}
