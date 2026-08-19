/**
 * IDE Service — World-State-driven visual progression.
 * The player can type anything — typing has no functional effect (immersion only).
 * What the prototype "includes" is computed from requirements.discovered in World State.
 * First IDE run fires the 'ide_first_run' flag which triggers Olivia's review event.
 */

import { readWorldState, mutateWorldState, markEventFired, logSignal } from '../engine/worldState.engine';
import { getScenarioConfig } from '../config/scenarios/scenario.registry';

// ── Build log lines (fixed progression, immersive only) ──────────────────────

const BUILD_LOG_LINES = [
  '[00:01] Initialising build environment...',
  '[00:02] Resolving dependencies...',
  '[00:04] Compiling TypeScript sources...',
  '[00:07] Running type checks...',
  '[00:09] Building API layer...',
  '[00:11] Bundling frontend assets...',
  '[00:14] Running unit tests (18 passed, 0 failed)...',
  '[00:17] Generating API documentation...',
  '[00:19] Packaging artefacts...',
  '[00:21] Build complete ✓',
];

const PROGRESS_STEPS = [
  { label: 'Environment setup', pct: 10 },
  { label: 'Core services compiled', pct: 30 },
  { label: 'API endpoints registered', pct: 50 },
  { label: 'Frontend assets bundled', pct: 70 },
  { label: 'Integration tests passed', pct: 85 },
  { label: 'Prototype ready', pct: 100 },
];

// Map requirement IDs → prototype UI module names shown in the preview
const REQ_TO_MODULE: Record<string, string> = {
  req_sso: 'Single Sign-On (SSO) Login',
  req_dashboard: 'Employee Dashboard',
  req_leave: 'Leave Management',
  req_attendance: 'Attendance Tracker',
  req_directory: 'Employee Directory',
  req_payroll: 'Payroll Integration (stub)',
  req_documents: 'Document Management',
  req_announcements: 'HR Announcements',
  req_approvals: 'Approval Workflow',
  req_notifications: 'Notification Centre',
  req_doc_upload: 'Employee Document Upload',
  req_audit_logs: 'Audit Log Viewer',
  req_rbac: 'Role-Based Access Control (RBAC)',
};

// ── Service ───────────────────────────────────────────────────────────────────

export interface IDERunResult {
  build_log: string[];
  progress_steps: typeof PROGRESS_STEPS;
  prototype_modules: string[];
  missing_modules: string[];
  is_first_run: boolean;
}

/**
 * Run the IDE — returns fixed visual progression + prototype feature list
 * derived from World State's discovered requirements.
 */
export async function runIDE(sessionId: string): Promise<IDERunResult> {
  const state = await readWorldState(sessionId);
  if (!state) throw new Error(`Session not found: ${sessionId}`);

  const config = getScenarioConfig(state.scenario_id);
  if (!config) throw new Error(`Scenario not found`);

  const isFirstRun = !state.fired_events.includes('ide_first_run');

  if (isFirstRun) {
    // Mark ide_first_run — this triggers Olivia's review via the orchestrator
    await markEventFired(sessionId, 'ide_first_run');

    await mutateWorldState(sessionId, (s) => ({
      project_status: 'in_development',
    }), {
      type: 'ide_run',
      actor: 'player',
      target: 'ide',
      payload: { first_run: true },
    });

    // Log signal: development started before/after security review
    const oliviaContacted = state.conversation_threads['olivia']?.some(
      (m) => m.role === 'player'
    );
    await logSignal(sessionId, {
      dimension: 'decision_quality',
      signal_type: 'ide_run_before_security_review',
      value: oliviaContacted ? 5 : -8,
      description: oliviaContacted
        ? 'Development started after player contacted InfoSec — good sequencing.'
        : 'Development started without InfoSec consultation — missed compliance gate.',
    });
  } else {
    await mutateWorldState(sessionId, () => ({}), {
      type: 'ide_run',
      actor: 'player',
      target: 'ide',
      payload: { first_run: false },
    });
  }

  // Compute prototype features from discovered requirements
  const discovered = state.requirements.discovered;
  const allReqIds = config.requirements.map((r) => r.id);

  const prototype_modules = discovered
    .filter((id) => REQ_TO_MODULE[id])
    .map((id) => REQ_TO_MODULE[id]);

  const missing_modules = allReqIds
    .filter((id) => !discovered.includes(id) && REQ_TO_MODULE[id])
    .map((id) => REQ_TO_MODULE[id]);

  // Update prototype state if all core requirements are covered
  const coreReqs = ['req_sso', 'req_dashboard', 'req_leave', 'req_attendance', 'req_directory'];
  const coreReady = coreReqs.every((id) => discovered.includes(id));
  if (coreReady && state.project_status === 'in_development') {
    await mutateWorldState(sessionId, () => ({ project_status: 'prototype_ready' }));
  }

  return {
    build_log: BUILD_LOG_LINES,
    progress_steps: PROGRESS_STEPS,
    prototype_modules,
    missing_modules,
    is_first_run: isFirstRun,
  };
}
