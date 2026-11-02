/**
 * chapterEvaluator.service.ts
 * Unified AI-Powered Evaluation Engine for Chapters 1 through 7+
 * Powered by Grok (xAI / Groq OpenAI-compatible LLM endpoint)
 * 
 * Provides rigorous, nuanced, executive-grade evaluation of digital transformation,
 * engineering leadership, and governance decisions.
 */

import { llmClient, LLM_MODEL } from '../config/llm.client';
import { logSignal } from '../engine/worldState.engine';

export interface UnifiedScorecard {
  chapterId: number;
  totalScore: number; // 0-100
  scheduleScore: number; // 0-100
  riskScore: number; // 0-100
  governanceScore: number; // 0-100
  efficiencyScore: number; // 0-100
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

interface ChapterPromptConfig {
  chapterTitle: string;
  evaluatorName: string;
  evaluatorRole: string;
  context: string;
  rubricGuidelines: string;
}

const CHAPTER_PROMPT_CONFIGS: Record<number, ChapterPromptConfig> = {
  1: {
    chapterTitle: 'Chapter 1: The Briefing & Scope Assignment (Project Amigo)',
    evaluatorName: 'Aarav Kapoor',
    evaluatorRole: 'Lead Engagement Partner, Digital Transformation Practice',
    context: `
Project Amigo is ICICI Bank's 80,000-employee HRMS modernization.
The player just completed the kickoff meeting with Sophia Bennett (VP of HR) and Daniel Brooks (Tech Lead).
The player had to submit their initial planning proposal:
1. Module Prioritization (choose 3 from Appraisals, Attendance, Leave Management, Form 16, Learning Management, Digital Visiting Cards).
   Note: Appraisals is tied to the upcoming Q3 corporate appraisal cycle and non-negotiable. Attendance & Leave provide the core data foundation.
2. Technical Dependency Management for LDAP Sandbox Access:
   Option A: Defer access and proceed on assumptions (reckless, causes massive rework).
   Option B: Record LDAP as an explicit dependency, follow up with bank IT owner, and continue unblocked tracks (best practice).
   Option C: Pause all project work until LDAP access is granted (excessive paralysis).
3. Critical Validation Gates (whether to validate 30,000 peak concurrent logins, delivery within 90 days, formal client Phase 1 signoff).`,
    rubricGuidelines: `
- Prioritizing Appraisals + (Attendance or Leave) aligns with statutory business deadlines and core data architecture. Selecting Digital Visiting Cards or LMS over Appraisals displays poor business prioritization.
- Handling LDAP via Option B demonstrates mature delivery governance. Option A introduces severe technical debt. Option C halts velocity unnecessarily.
- Selecting peak load validation and 90-day feasibility reflects rigorous risk management.`,
  },
  2: {
    chapterTitle: 'Chapter 2: Environment Prerequisites, Network Gates & UI/UX Signoff',
    evaluatorName: 'Marcus Reed & Aarav Kapoor',
    evaluatorRole: 'Client CTO (ICICI Bank) & Delivery Partner',
    context: `
Day 2–3 of Project Amigo. Engineering team is blocked from staging by enterprise security firewalls and proxy restrictions.
The player had to make 3 critical decisions:
1. Staging Network Access:
   'secure': Submit formal Bank IT prerequisite ticket (outbound 443, proxy routes, LDAP) while unblocking developers with local mocks and synthetic stubs (Ideal).
   'unsafe': Attempt to bypass bank firewall with reverse SSH tunnels or unauthorized external test servers (Critical enterprise security violation).
   'wait': Stop all developer work until Bank IT responds (Avoidable idle cost).
2. Stakeholder Communication Structure:
   'dual-track': Dedicated technical channel for engineering sync, paired with weekly executive status dashboards for sponsors (Ideal).
   'single-chat': Dumping developers and executives into a single noisy group (Loss of signal, micromanagement).
3. UI/UX Design Signoff:
   'written': Secure Marcus Reed's formal written baseline signoff on exported prototypes before coding starts (Ideal).
   'verbal': Accept informal verbal approval on a call (High rework risk when requirements shift).
4. Sprint 1 Greenlight: Verifying all prerequisites before authorizing sprint start.`,
    rubricGuidelines: `
- Award high Risk/Governance (90+) ONLY if 'secure' infrastructure and 'written' signoff were chosen.
- If 'unsafe' was initially picked, heavily penalize Risk (<60) and cite enterprise compliance violation.
- If 'single-chat' was picked, note governance clutter.`,
  },
  3: {
    chapterTitle: 'Chapter 3: UAT Infrastructure & Environment Coordination',
    evaluatorName: 'Daniel Brooks & Sophia Bennett',
    evaluatorRole: 'Lead Technical Architect & VP of HR',
    context: `
Daniel Brooks requested UAT environment configuration details from client HR/IT.
Sophia sent 'Project_Amigo_UAT_Details_v1.pdf' confirming Server IP, API Base URL, Login API, and Test Users.
CRITICAL GAP: Sophia's v1 omitted network access requirements (firewall allowlisting, outbound port 443, proxy rules).
The player had to:
1. Audit Sophia's v1 delivery against Daniel's prerequisite checklist.
2. Detect the missing network configuration before forwarding.
3. Follow up with Sophia to receive 'Project_Amigo_UAT_Details_v2.pdf' with confirmed network specs.
4. Verify all 5 prerequisites with Daniel before greenlighting UAT integration.`,
    rubricGuidelines: `
- Identifying the network gap proactively before forwarding = 'strong' (90-100%).
- Forwarding v1 blindly and only recovering when Daniel pointed out the missing firewall info = 'mixed' (75-84%).
- Failing to verify prerequisites = 'incomplete' (<70%).`,
  },
  4: {
    chapterTitle: 'Chapter 4: Change Request & Impact Analysis (CR-017 Dynamic Bonus)',
    evaluatorName: 'Sophia Bennett & Aarav Kapoor',
    evaluatorRole: 'Client HR Lead & Delivery Governance Partner',
    context: `
Sophia requested Change Request CR-017 (Dynamic Bonus Calculator) for Phase 1.
The 90-day deadline is fixed. CR-017 requires live payroll system integration, complex RBAC for confidential salary data, and raises concurrency load risks.
The player had to:
1. Assess Schedule, Dependency, Security, and Business Value impacts.
2. Decide Feature Placement: Keep baseline in Phase 1 (Appraisals, Attendance, Leave, Form 16); defer CR-017 Dynamic Bonus to Phase 2.
3. Provide a written justification explaining the decision to Sophia without damaging the client relationship.`,
    rubricGuidelines: `
- Accepting CR-017 into Phase 1 is a catastrophic delivery failure (timeline breach, untested payroll dependencies). Penalize Schedule & Risk (<60).
- Recommending Phased Release (Phase 1 Baseline + Phase 2 CR-017 Pilot) with rigorous payroll security controls is exemplary (90-100%).
- Evaluate the player's written justification for clarity, diplomacy, and technical rigor.`,
  },
  5: {
    chapterTitle: 'Chapter 5: The Launch Decision (Release Readiness)',
    evaluatorName: 'CISO Office & Aarav Kapoor',
    evaluatorRole: 'Enterprise Information Security Officer & Engagement Partner',
    context: `
Phase 1 build passed functional QA in staging. Sophia wants to launch directly to all 80,000 bank employees.
However:
1. Load test telemetry shows PostgreSQL connection pool saturation at 15,000 users.
2. Security audit flagged unencrypted JWT auth tokens stored in localStorage without HttpOnly flags.
The player had to:
1. Choose Rollout Strategy: A controlled 500-user 48-hour pilot across 2 branch offices (Best) vs direct 80k launch (Catastrophic) vs canceling project (Overreaction).
2. Mandate Blockers: DB connection pool expansion to 300 + Redis caching, plus HttpOnly Secure SameSite cookie remediation.
3. Define strict Rollback Gates (<0.5% errors, <1.2s P95 latency) and dual signoff before 80k expansion.`,
    rubricGuidelines: `
- Launching directly to 80,000 is an immediate failure (Risk < 50).
- Approving a controlled 500-user pilot while gating release on DB connection pool and JWT cookie fixes is exemplary (90-100%).
- Check if rollback criteria and monitoring gates were specified.`,
  },
  6: {
    chapterTitle: 'Chapter 6: The 30,000-User Stress Test (Performance Command Centre)',
    evaluatorName: 'Marcus Reed & Durgaprasad Karri',
    evaluatorRole: 'CTO (ICICI Bank) & Lead Site Reliability Engineer',
    context: `
Under simulated 30,000-user load, Project Amigo suffered an incident:
- P95 Latency spiked to 4.2 seconds (SLA limit: 2.0s).
- Database connection pool reached 98% saturation.
- Error rate jumped to 14.8%.
The player had to:
1. Diagnose Root Cause: Redis cache miss on appraisal templates + undersized PostgreSQL pool (50 connections) starving threads.
2. Sequence Technical Remediation: (1) Warm Redis appraisal cache & index query keys -> (2) Expand connection pool to 300 -> (3) Trigger retest cycle.
3. Retest Telemetry: Latency dropped to 180ms, errors dropped to 0%, DB pool utilization stabilized at 38%.
4. Governance: Secure dual signoff from Daniel Brooks (Tech Lead) and Marcus Reed (Client CTO) before release approval.`,
    rubricGuidelines: `
- Correct root cause diagnosis + proper remediation sequencing + retest verification + dual signoffs = 'strong' (92-100%).
- If player tried to retest before fixing both cache and pool size, note diagnostic oversight.
- Check that both engineering and executive approvals were secured before production signoff.`,
  },
  7: {
    chapterTitle: 'Chapter 7: Production Issues & Root Cause Analysis (Incident & RCA Studio)',
    evaluatorName: 'Alex Mercer & Jane Cooper',
    evaluatorRole: 'Senior Incident Commander & Director of Software Quality',
    context: `
Post-deployment incident in production:
Attendance Sync microservice threw intermittent 504 Gateway Timeouts affecting 12 branch officers in Mumbai and Pune.
Alex identified an unclosed socket descriptor leak in HTTP keep-alive loops to biometric punch clocks.
The player had to:
1. Service Restoration Sequence: Isolate degraded pods -> Deploy hotfix v1.4.2 -> Restart microservice cluster -> Verify 12 branch officers can sync attendance.
2. Formal 4-Part RCA: Document Incident Summary, Technical Root Cause (file handle exhaustion from TCP socket leaks), Business Impact (12 officers, 84 records delayed, zero data loss), Immediate Remediation.
3. Preventive Controls: Prioritize automated socket timeout guards, container healthcheck circuit breakers, and synthetic canary probes.`,
    rubricGuidelines: `
- Executing the correct 4-step restoration sequence without skipping branch verification = high marks.
- Precise RCA identifying TCP socket exhaustion rather than vague 'server crash' = high marks.
- Selecting comprehensive preventive controls (socket timeouts + health probes) prevents recurrence.`,
  },
  8: {
    chapterTitle: 'Chapter 8: Security Attacks, Policies & Compliance',
    evaluatorName: 'Chief Information Security Officer (CISO)',
    evaluatorRole: 'Enterprise Information Security Officer',
    context: `
Credential-stuffing attack on employee login portal.
Player had to investigate bot telemetry, configure WAF bot mitigation, enforce strict MFA rate-limiting, and prepare a compliance disclosure under IT Security Acts.`,
    rubricGuidelines: `
- Enforcing WAF bot shields and MFA protection while preserving audit trails = 90-100%.`,
  },
  9: {
    chapterTitle: 'Chapter 9: ROI (Return on Investment) Validation',
    evaluatorName: 'Mark Sterling',
    evaluatorRole: 'Head of HR & Executive Steering Committee Sponsor (ICICI Bank)',
    context: `
Project Amigo has gone live across ICICI Bank's 80,000 employees. The executive leadership phase (23:00–25:00) has begun.
Jane (Lead PM) and Martha (Lead Ops Telemetry) aggregated performance telemetry:
1. Operational Telemetry: 42% reduction in appraisal cycle completion time (from 21 days down to 12.2 days), saving 15,000 operational man-hours.
2. Financial ROI Modeling: Translating 15,000 man-hours saved at a blended internal cost of ₹650/hr into ₹97.5 Lakhs ($375k) in operational capacity savings against a ₹55 Lakhs ($210k) Phase 1 investment. This yields a Net Benefit of ₹42.5 Lakhs, +77.3% Year 1 Net ROI, and a 6.8-month payback period.
3. Executive Boardroom Decision:
   - Choice A (Poor decision): Skip formal ROI tracking; assume leadership already knows the project was successful.
   - Choice B (Recommended): Deliver detailed ROI and business value impact presentation to the executive steering committee.`,
    rubricGuidelines: `
- Choice B represents exemplary senior PM leadership (+15 Schedule, +25 Delivery Governance, +20 Trust & Risk, +15 Efficiency). Praise the candidate for understanding that 15,000 hours saved is an operational metric that MUST be converted into financial currency (cost savings and payback period) to justify capital investment to the CFO and secure Phase 2 budget.
- Choice A is a critical delivery failure (-20 Delivery Governance, -15 Trust & Risk). PMs who assume executives "just know" projects succeeded invariably suffer budget freezes because the CFO views the project as an unquantified cost center.
- Provide sharp, realistic boardroom feedback from Mark Sterling, praising or critiquing their executive maturity.`,
  },
};

/**
 * Main evaluation entry point
 */
export async function evaluateChapterWithAI(
  chapterId: number,
  playerInput: any,
  playerContext?: { name?: string; role?: string; company?: string; sessionId?: string }
): Promise<UnifiedScorecard> {
  const config = CHAPTER_PROMPT_CONFIGS[chapterId] || CHAPTER_PROMPT_CONFIGS[1];
  const now = new Date().toISOString();

  try {
    const prompt = `You are ${config.evaluatorName}, ${config.evaluatorRole}.
You are conducting a strict, realistic, executive-grade evaluation of a Digital Transformation Consultant's work on "${config.chapterTitle}".

SCENARIO CONTEXT:
${config.context}

EVALUATION RUBRIC & GUIDELINES:
${config.rubricGuidelines}

PLAYER'S ACTUAL SUBMISSION & DECISIONS:
${JSON.stringify(playerInput, null, 2)}

PLAYER CONTEXT:
Name: ${playerContext?.name || 'Consultant'}
Role: ${playerContext?.role || 'Digital Transformation Consultant'}

YOUR EVALUATION INSTRUCTIONS:
1. Provide an authentic, non-generic, highly realistic evaluation. Speak directly in your executive voice (${config.evaluatorName}).
2. Score the following dimensions on a 0-100 scale:
   - scheduleScore: Impact on delivery deadlines, milestones, sprint pacing.
   - riskScore: Handling of technical debt, enterprise security, system stability, failure prevention.
   - governanceScore: Scope management, formal signoffs, audit trails, client expectation management.
   - efficiencyScore: Engineering momentum, eliminating developer blockers, avoiding rework or idle wait times.
3. Compute totalScore (weighted average of the 4 dimensions, 0-100).
4. Assign outcomeType: 'strong' (totalScore >= 85), 'mixed' (70 <= totalScore < 85), or 'incomplete' (totalScore < 70).
5. Generate an outcomeTitle: A punchy 3-6 word uppercase executive outcome banner (e.g. "EXEMPLARY DELIVERY GOVERNANCE", "TECHNICAL STABILIZATION WITH DEBT", "CRITICAL RISK EXPOSURE").
6. Provide an executiveSummary (2-4 sentences): Honest, candid executive appraisal of their performance.
7. List 3 specific strengths: Concrete things they did right based on their actual choices (reference specific artifacts, names, or metrics).
8. List 2-3 specific improvements/risks: Concrete missed opportunities, overlooked risks, or trade-offs made.
9. Provide leadershipCoaching (1-2 sentences): A memorable, strategic rule-of-thumb or principle for enterprise transformation.
10. Provide explanations for each of the 4 dimensions (schedule, risk, governance, efficiency).

Return ONLY valid JSON matching this schema:
{
  "totalScore": number,
  "scheduleScore": number,
  "riskScore": number,
  "governanceScore": number,
  "efficiencyScore": number,
  "outcomeType": "strong" | "mixed" | "incomplete",
  "outcomeTitle": string,
  "outcomeText": string,
  "executiveSummary": string,
  "strengths": string[],
  "improvements": string[],
  "leadershipCoaching": string,
  "explanations": {
    "schedule": string,
    "risk": string,
    "governance": string,
    "efficiency": string
  }
}`;

    const completion = await llmClient.chat.completions.create({
      model: LLM_MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You are an elite enterprise delivery auditor and CTO evaluating a digital transformation simulation. Evaluate with rigorous realism, precision, and clear enterprise domain depth. Output pure JSON only.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.25,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from Grok LLM');
    }

    const parsed = JSON.parse(content);

    // Sanitize and normalize scores
    const clamp = (val: any, def = 75) => {
      const num = Number(val);
      if (isNaN(num)) return def;
      return Math.min(Math.max(Math.round(num), 0), 100);
    };

    const scheduleScore = clamp(parsed.scheduleScore, 80);
    const riskScore = clamp(parsed.riskScore, 80);
    const governanceScore = clamp(parsed.governanceScore, 80);
    const efficiencyScore = clamp(parsed.efficiencyScore, 80);
    const totalScore = clamp(
      parsed.totalScore,
      Math.round((scheduleScore + riskScore + governanceScore + efficiencyScore) / 4)
    );

    const outcomeType: 'strong' | 'mixed' | 'incomplete' =
      totalScore >= 85 ? 'strong' : totalScore >= 70 ? 'mixed' : 'incomplete';

    const scorecard: UnifiedScorecard = {
      chapterId,
      totalScore,
      scheduleScore,
      riskScore,
      governanceScore,
      efficiencyScore,
      outcomeType: parsed.outcomeType || outcomeType,
      outcomeTitle: parsed.outcomeTitle || (totalScore >= 85 ? 'EXEMPLARY PERFORMANCE' : 'OPERATIONAL DEFICIT DETECTED'),
      outcomeText: parsed.outcomeText || parsed.executiveSummary || 'Evaluation completed.',
      evaluatorName: config.evaluatorName,
      evaluatorRole: config.evaluatorRole,
      executiveSummary: parsed.executiveSummary || parsed.outcomeText || 'Consultant demonstrated solid domain comprehension.',
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : ['Accurate initial scoping', 'Recognized enterprise constraints'],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements : ['Validate peak capacity earlier', 'Formalize stakeholder communication paths'],
      whatYouDidWell: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      whatToImprove: Array.isArray(parsed.improvements) ? parsed.improvements : [],
      leadershipCoaching: parsed.leadershipCoaching || 'In enterprise transformation, early boundary alignment prevents late delivery collapse.',
      personalizedTakeaway: parsed.leadershipCoaching,
      keyTakeaway: parsed.leadershipCoaching,
      explanations: {
        schedule: parsed.explanations?.schedule || 'Delivery schedule maintained within baseline tolerance.',
        risk: parsed.explanations?.risk || 'Enterprise risk profile actively managed.',
        governance: parsed.explanations?.governance || 'Stakeholder governance established.',
        efficiency: parsed.explanations?.efficiency || 'Engineering momentum sustained.',
      },
      aiEvaluated: true,
      modelUsed: LLM_MODEL,
      evaluatedAt: now,
    };

    // Log to session world state if session ID is provided
    if (playerContext?.sessionId) {
      try {
        await logSignal(playerContext.sessionId, {
          dimension: 'decision_quality',
          signal_type: `chapter_${chapterId}_ai_evaluated`,
          value: totalScore,
          description: `Chapter ${chapterId} evaluated by ${LLM_MODEL}: ${scorecard.outcomeTitle} (${totalScore}%)`,
        });
      } catch (err) {
        // non-blocking
      }
    }

    return scorecard;
  } catch (err: any) {
    console.warn(`[CHAPTER EVALUATOR] Grok AI evaluation failed for Chapter ${chapterId}, falling back to deterministic calibration:`, err?.message || err);
    return computeDeterministicFallbackScorecard(chapterId, playerInput, config);
  }
}

/**
 * Deterministic fallback if network/API key is unreachable
 */
function computeDeterministicFallbackScorecard(
  chapterId: number,
  input: any,
  config: ChapterPromptConfig
): UnifiedScorecard {
  const now = new Date().toISOString();
  let scheduleScore = 80;
  let riskScore = 80;
  let governanceScore = 80;
  let efficiencyScore = 80;
  let outcomeTitle = 'ASSESSMENT VERIFIED';
  let summary = 'Submission reviewed against delivery benchmarks.';
  const strengths: string[] = [];
  const improvements: string[] = [];

  switch (chapterId) {
    case 1: {
      const priorities = Array.isArray(input?.priorities) ? input.priorities : [];
      const hasAppraisals = priorities.includes('Appraisals');
      const hasAttendance = priorities.includes('Attendance');
      const hasLeave = priorities.includes('Leave Management');
      const dependency = input?.dependencyChoice;
      const validations = Array.isArray(input?.validations) ? input.validations : [];

      if (hasAppraisals) {
        scheduleScore += 10;
        strengths.push('Protected core Q3 corporate appraisal cycle deadline');
      } else {
        scheduleScore -= 20;
        improvements.push('Omitted Appraisals, failing to address the primary business catalyst');
      }

      if (dependency === 'B') {
        riskScore += 15;
        governanceScore += 15;
        efficiencyScore += 10;
        strengths.push('Governed LDAP dependency through formal ownership without halting unblocked engineering tracks');
      } else if (dependency === 'A') {
        riskScore -= 25;
        governanceScore -= 20;
        improvements.push('Proceeded on unverified assumptions, introducing severe downstream integration rework');
      } else {
        scheduleScore -= 15;
        efficiencyScore -= 20;
        improvements.push('Halted entire project velocity over a single module dependency');
      }

      if (validations.includes('peak_load')) {
        governanceScore += 10;
        strengths.push('Accounted for 30,000 peak concurrent user volume upfront');
      }
      break;
    }

    case 2: {
      const infra = input?.infrastructure?.initialDecision;
      const comm = input?.communication?.initialDecision;
      const uiux = input?.uiux?.initialDecision;

      if (infra === 'secure') {
        riskScore += 18;
        governanceScore += 15;
        strengths.push('Refused to bypass enterprise security boundaries while unblocking developers with offline mocks');
      } else if (infra === 'unsafe') {
        riskScore -= 35;
        governanceScore -= 30;
        improvements.push('Attempted unauthorized firewall bypass, violating ICICI enterprise security policy');
      } else {
        scheduleScore -= 20;
        efficiencyScore -= 25;
        improvements.push('Froze all development tracks waiting on Bank IT responses');
      }

      if (comm === 'dual-track') {
        efficiencyScore += 15;
        governanceScore += 10;
        strengths.push('Created dedicated engineering channels separated from executive milestone reporting');
      }

      if (uiux === 'written') {
        governanceScore += 15;
        scheduleScore += 10;
        strengths.push('Locked written baseline approval for prototypes before Sprint 1 coding began');
      } else {
        governanceScore -= 15;
        improvements.push('Relied on verbal design consensus, creating high risk of late-sprint scope creep');
      }
      break;
    }

    case 3: {
      const path = input?.pathTaken;
      if (path === 'full_credit' || input?.playerIdentifiedNetworkGap) {
        scheduleScore = 96;
        riskScore = 95;
        governanceScore = 100;
        efficiencyScore = 95;
        strengths.push('Audited Sophia\'s v1 delivery against Daniel\'s prerequisites and flagged missing network details');
        strengths.push('Prevented engineering team from encountering false-start configuration blocks');
      } else {
        scheduleScore = 80;
        riskScore = 78;
        governanceScore = 82;
        efficiencyScore = 75;
        improvements.push('Forwarded incomplete specs before checking developer requirements');
      }
      break;
    }

    case 4: {
      const rec = input?.finalRecommendation;
      if (rec === 'phased_release' || rec === 'phase2_defer') {
        scheduleScore = 94;
        riskScore = 92;
        governanceScore = 96;
        efficiencyScore = 90;
        strengths.push('Protected 90-day baseline commitments while structuring CR-017 into Phase 2');
        strengths.push('Highlighted unverified live payroll dependencies and RBAC data leak risks');
      } else {
        scheduleScore = 65;
        riskScore = 60;
        governanceScore = 68;
        improvements.push('Accepted high-risk change request into fixed Phase 1 schedule, endangering statutory appraisal launch');
      }
      break;
    }

    case 5: {
      const strat = input?.rolloutStrategy || input?.selectedDecision;
      if (strat === 'controlled_pilot' || strat === 'pilot_500') {
        scheduleScore = 92;
        riskScore = 95;
        governanceScore = 95;
        efficiencyScore = 90;
        strengths.push('Selected a controlled 500-user 48-hour pilot across two branch offices');
        strengths.push('Mandated DB connection pool expansion and HttpOnly token cookie remediation as prerequisite gates');
      } else {
        scheduleScore = 55;
        riskScore = 48;
        governanceScore = 52;
        improvements.push('Attempted direct 80,000-user deployment despite known DB saturation and token vulnerabilities');
      }
      break;
    }

    case 6: {
      const verified = input?.retestVerified || input?.stressTestCompleted;
      const approved = input?.dualApproved || (input?.signedByDaniel && input?.signedByMarcus);
      if (verified && approved) {
        scheduleScore = 95;
        riskScore = 96;
        governanceScore = 98;
        efficiencyScore = 94;
        strengths.push('Correctly diagnosed Redis cache miss and DB connection pool saturation under 30k load');
        strengths.push('Secured dual technical and executive signoff after verifying retest telemetry (180ms latency)');
      } else {
        scheduleScore = 78;
        riskScore = 72;
        governanceScore = 75;
        improvements.push('Proceeded without full remediation sequencing or dual engineering signoff');
      }
      break;
    }

    case 7: {
      const restored = input?.restorationCompleted || input?.verifiedBranchOfficers;
      const rcaDone = input?.rcaSubmitted || input?.rcaPartsCompleted >= 4;
      if (restored && rcaDone) {
        scheduleScore = 94;
        riskScore = 95;
        governanceScore = 96;
        efficiencyScore = 92;
        strengths.push('Executed proper service restoration sequence and verified the 12 affected branch officers');
        strengths.push('Authored formal 4-part RCA accurately diagnosing TCP socket leak in biometric sync loops');
        strengths.push('Prioritized automated socket timeout guards and synthetic canary health probes');
      } else {
        scheduleScore = 75;
        riskScore = 70;
        governanceScore = 74;
        improvements.push('Incident restoration closed before verifying end-user branch sync connectivity');
      }
      break;
    }

    default: {
      scheduleScore = 85;
      riskScore = 85;
      governanceScore = 85;
      efficiencyScore = 85;
      strengths.push('Demonstrated competent delivery execution');
      break;
    }
  }

  const clamp = (n: number) => Math.min(Math.max(Math.round(n), 15), 100);
  const finalSchedule = clamp(scheduleScore);
  const finalRisk = clamp(riskScore);
  const finalGov = clamp(governanceScore);
  const finalEff = clamp(efficiencyScore);
  const totalScore = Math.round((finalSchedule + finalRisk + finalGov + finalEff) / 4);

  const outcomeType = totalScore >= 85 ? 'strong' : totalScore >= 70 ? 'mixed' : 'incomplete';
  outcomeTitle =
    outcomeType === 'strong'
      ? 'EXEMPLARY DELIVERY GOVERNANCE'
      : outcomeType === 'mixed'
      ? 'CONTROLLED PROGRESS WITH OPERATIONAL TRADEOFFS'
      : 'CRITICAL GOVERNANCE DEFICIT';

  summary = `${config.evaluatorName} completed assessment: overall score of ${totalScore}%.`;

  return {
    chapterId,
    totalScore,
    scheduleScore: finalSchedule,
    riskScore: finalRisk,
    governanceScore: finalGov,
    efficiencyScore: finalEff,
    outcomeType,
    outcomeTitle,
    outcomeText: summary,
    evaluatorName: config.evaluatorName,
    evaluatorRole: config.evaluatorRole,
    executiveSummary: summary,
    strengths,
    improvements,
    whatYouDidWell: strengths,
    whatToImprove: improvements,
    leadershipCoaching:
      'In digital transformation, true velocity comes from setting uncompromised technical foundations before accelerating.',
    personalizedTakeaway:
      'In digital transformation, true velocity comes from setting uncompromised technical foundations before accelerating.',
    keyTakeaway:
      'In digital transformation, true velocity comes from setting uncompromised technical foundations before accelerating.',
    explanations: {
      schedule: `Schedule performance calibrated at ${finalSchedule}%.`,
      risk: `Enterprise risk exposure managed at ${finalRisk}%.`,
      governance: `Delivery governance score calibrated at ${finalGov}%.`,
      efficiency: `Engineering efficiency rated at ${finalEff}%.`,
    },
    aiEvaluated: false,
    evaluatedAt: now,
  };
}
