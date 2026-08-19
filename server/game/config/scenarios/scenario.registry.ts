/**
 * Scenario Registry — maps scenario IDs to their config objects.
 * Add new scenarios here without changing any engine code.
 */

import type { ScenarioDef } from './scenario.types';
import { TITAN_SCENARIO } from './titan.config';

const REGISTRY: Record<string, ScenarioDef> = {
  [TITAN_SCENARIO.id]: TITAN_SCENARIO,
};

export function getScenarioConfig(scenarioId: string): ScenarioDef | null {
  return REGISTRY[scenarioId] ?? null;
}

export function listScenarios(): Array<{ id: string; name: string; client: string }> {
  return Object.values(REGISTRY).map((s) => ({ id: s.id, name: s.name, client: s.client }));
}
