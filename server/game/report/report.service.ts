/**
 * Report Generator — final report production (§2.10).
 * 1. One LLM call → Executive Report JSON (all sections, per-character feedback in character voice)
 * 2. Puppeteer renders HTML template → PDF
 * 3. PDF uploaded to storage, URL returned
 */


import puppeteer from 'puppeteer';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { llmClient as openai, LLM_MODEL } from '../config/llm.client';
import { ENV } from '../../config/env';
import { readWorldState, mutateWorldState } from '../engine/worldState.engine';
import { getScenarioConfig } from '../config/scenarios/scenario.registry';
import { PERSONA_CONFIGS } from '../characters/character.personas';
import { uploadBuffer } from '../storage/storage.service';


// ── Report types ──────────────────────────────────────────────────────────────

export interface FinalReport {
  session_id: string;
  generated_at: string;
  executive_summary: string;
  timeline: string;
  major_decisions: string[];
  missed_opportunities: string[];
  requirement_coverage: {
    discovered: string[];
    missed: string[];
    compliance_gates_met: boolean;
  };
  stakeholder_feedback: Array<{
    character_id: string;
    character_name: string;
    feedback: string; // written in that character's voice
  }>;
  communication_analysis: string;
  presentation_analysis: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  overall_score: number; // 0-100, only revealed here
  pdf_url: string | null;
}

// ── Generate report ───────────────────────────────────────────────────────────

export async function generateReport(sessionId: string): Promise<FinalReport> {
  const state = await readWorldState(sessionId);
  if (!state) throw new Error(`Session not found: ${sessionId}`);
  if (!state.evaluation) throw new Error(`Evaluation not complete for session ${sessionId}`);

  const config = getScenarioConfig(state.scenario_id);
  if (!config) throw new Error(`Scenario not found`);

  const evalSummary = state.evaluation;
  const characterFeedbackPrompt = config.characters
    .map((c) => {
      const persona = PERSONA_CONFIGS[c.id];
      const trustScore = state.stakeholder_trust[c.id] ?? 70;
      return `Character: ${c.name} (${c.role})
Trust score with consultant: ${trustScore}/100
Voice/style: ${persona?.systemPrompt.split('\n')[0] ?? c.role}
Scope of knowledge: ${persona?.knowledgeScopeDescription ?? ''}`;
    })
    .join('\n\n');

  const prompt = `You are generating a final Executive Performance Report for a Digital Transformation Consultant who completed the "${config.name}" simulation for client "${config.client}".

EVALUATION RESULTS:
Total Score: ${evalSummary.total_score}/100
Strengths: ${evalSummary.strengths.join('; ')}
Weaknesses: ${evalSummary.weaknesses.join('; ')}
Dimension Scores: ${evalSummary.dimensions.map((d) => `${d.name}: ${d.score}/100 (weighted: ${d.weighted_score.toFixed(1)})`).join(', ')}

WORLD STATE:
Requirements discovered: ${state.requirements.discovered.length}/${config.requirements.length}
Requirements missed: ${state.requirements.hidden.join(', ') || 'none'}
MOM submitted: ${state.mom.submitted_at ? 'Yes' : 'No'}
Project status: ${state.project_status}
Presentation transcript (excerpt): ${(state.presentation.transcript ?? '').slice(0, 500)}

CHARACTER STAKEHOLDERS (write feedback in their voice):
${characterFeedbackPrompt}

Generate a detailed executive report as JSON:
{
  "executive_summary": "2-3 paragraph summary of the consultant's performance",
  "timeline": "Narrative of key moments in chronological order",
  "major_decisions": ["Decision 1...", "Decision 2..."],
  "missed_opportunities": ["..."],
  "communication_analysis": "Analysis of how well the consultant communicated across stakeholders",
  "presentation_analysis": "Analysis of the final presentation quality and accuracy",
  "recommendations": ["..."],
  "stakeholder_feedback": [
    {"character_id": "marcus", "feedback": "Written in Marcus's terse, direct style..."},
    {"character_id": "daniel", "feedback": "Written in Daniel's fast, practical style..."},
    {"character_id": "emma", "feedback": "Written in Emma's warm, employee-centric style..."},
    {"character_id": "olivia", "feedback": "Written in Olivia's evidence-driven, precise style..."},
    {"character_id": "sophia", "feedback": "Written in Sophia's business-focused, practical style..."}
  ]
}`;

  let reportContent: Omit<FinalReport, 'session_id' | 'generated_at' | 'requirement_coverage' | 'strengths' | 'weaknesses' | 'overall_score' | 'pdf_url'>;
  try {
    const completion = await openai.chat.completions.create({
      model: LLM_MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000,
      temperature: 0.5,
      response_format: { type: 'json_object' },
    });
    reportContent = JSON.parse(completion.choices[0]?.message?.content ?? '{}');
  } catch (err) {
    console.error('[REPORT] LLM report generation failed:', err);
    throw new Error('Report generation failed.');
  }

  const report: FinalReport = {
    session_id: sessionId,
    generated_at: new Date().toISOString(),
    executive_summary: reportContent.executive_summary ?? '',
    timeline: reportContent.timeline ?? '',
    major_decisions: reportContent.major_decisions ?? [],
    missed_opportunities: reportContent.missed_opportunities ?? [],
    requirement_coverage: {
      discovered: state.requirements.discovered,
      missed: state.requirements.hidden,
      compliance_gates_met:
        state.requirements.discovered.includes('req_audit_logs') &&
        state.requirements.discovered.includes('req_rbac'),
    },
    stakeholder_feedback: reportContent.stakeholder_feedback ?? [],
    communication_analysis: reportContent.communication_analysis ?? '',
    presentation_analysis: reportContent.presentation_analysis ?? '',
    strengths: evalSummary.strengths,
    weaknesses: evalSummary.weaknesses,
    recommendations: reportContent.recommendations ?? [],
    overall_score: evalSummary.total_score,
    pdf_url: null,
  };

  // Generate PDF
  let pdfUrl: string | null = null;
  try {
    pdfUrl = await renderReportToPDF(report, config.name, config.client);
    report.pdf_url = pdfUrl;
  } catch (err) {
    console.error('[REPORT] PDF generation failed:', err);
  }

  // Store report URL in World State
  await mutateWorldState(sessionId, () => ({
    evaluation: {
      ...state.evaluation!,
      completed_at: new Date(),
    },
  }));

  console.log(`[REPORT] Generated for session ${sessionId}. Score: ${report.overall_score}. PDF: ${pdfUrl ?? 'failed'}`);
  return report;
}

// ── PDF renderer ──────────────────────────────────────────────────────────────

async function renderReportToPDF(
  report: FinalReport,
  scenarioName: string,
  clientName: string
): Promise<string> {
  const html = buildReportHTML(report, scenarioName, clientName);

  const tmpPath = path.join(os.tmpdir(), `report_${report.session_id}.pdf`);

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.pdf({ path: tmpPath, format: 'A4', printBackground: true, margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' } });
  await browser.close();

  const buffer = fs.readFileSync(tmpPath);
  fs.unlinkSync(tmpPath);

  return uploadBuffer(buffer, `reports/${report.session_id}/report.pdf`, 'application/pdf');
}

function buildReportHTML(report: FinalReport, scenarioName: string, clientName: string): string {
  const scoreColor = report.overall_score >= 75 ? '#10b981' : report.overall_score >= 55 ? '#f59e0b' : '#ef4444';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; margin: 0; padding: 0; background: #fff; }
  .cover { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%); color: white; padding: 60px 40px; min-height: 200px; }
  .cover h1 { font-size: 28px; font-weight: 700; margin: 0 0 8px; }
  .cover p { font-size: 14px; opacity: 0.7; margin: 4px 0; }
  .score-badge { display: inline-block; font-size: 48px; font-weight: 900; color: ${scoreColor}; margin-top: 20px; }
  .score-label { font-size: 12px; opacity: 0.6; display: block; }
  .body { padding: 30px 40px; }
  h2 { font-size: 18px; font-weight: 700; border-bottom: 2px solid #e5e7eb; padding-bottom: 6px; margin: 28px 0 12px; color: #1a1a2e; }
  h3 { font-size: 14px; font-weight: 600; color: #374151; margin: 16px 0 6px; }
  p, li { font-size: 13px; line-height: 1.7; color: #374151; }
  ul { padding-left: 18px; }
  .strength { color: #10b981; font-weight: 600; }
  .weakness { color: #ef4444; font-weight: 600; }
  .char-feedback { background: #f9fafb; border-left: 3px solid #6366f1; padding: 10px 14px; margin: 8px 0; border-radius: 0 8px 8px 0; }
  .char-name { font-weight: 700; font-size: 12px; color: #6366f1; }
  .req-grid { display: flex; gap: 12px; flex-wrap: wrap; }
  .req-tag { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
  .req-found { background: #d1fae5; color: #065f46; }
  .req-missed { background: #fee2e2; color: #991b1b; }
</style>
</head>
<body>
<div class="cover">
  <h1>Performance Evaluation Report</h1>
  <p>${scenarioName}</p>
  <p>Client: ${clientName}</p>
  <p>Generated: ${new Date(report.generated_at).toLocaleDateString()}</p>
  <div class="score-badge">${report.overall_score}<span style="font-size:20px">/100</span></div>
  <span class="score-label">Overall Consultant Score</span>
</div>
<div class="body">
  <h2>Executive Summary</h2>
  <p>${report.executive_summary}</p>

  <h2>Requirement Coverage</h2>
  <div class="req-grid">
    ${report.requirement_coverage.discovered.map((r) => `<span class="req-tag req-found">✓ ${r}</span>`).join('')}
    ${report.requirement_coverage.missed.map((r) => `<span class="req-tag req-missed">✗ ${r}</span>`).join('')}
  </div>
  <p style="margin-top:8px">Compliance gates met: <strong>${report.requirement_coverage.compliance_gates_met ? 'Yes ✓' : 'No ✗'}</strong></p>

  <h2>Major Decisions</h2>
  <ul>${report.major_decisions.map((d) => `<li>${d}</li>`).join('')}</ul>

  <h2>Missed Opportunities</h2>
  <ul>${report.missed_opportunities.map((m) => `<li class="weakness">${m}</li>`).join('')}</ul>

  <h2>Stakeholder Feedback</h2>
  ${report.stakeholder_feedback.map((sf) => `
    <div class="char-feedback">
      <div class="char-name">${sf.character_name ?? sf.character_id}</div>
      <p style="margin:4px 0">${sf.feedback}</p>
    </div>
  `).join('')}

  <h2>Communication Analysis</h2>
  <p>${report.communication_analysis}</p>

  <h2>Presentation Analysis</h2>
  <p>${report.presentation_analysis}</p>

  <h2>Strengths</h2>
  <ul>${report.strengths.map((s) => `<li class="strength">${s}</li>`).join('')}</ul>

  <h2>Weaknesses</h2>
  <ul>${report.weaknesses.map((w) => `<li class="weakness">${w}</li>`).join('')}</ul>

  <h2>Recommendations</h2>
  <ul>${report.recommendations.map((r) => `<li>${r}</li>`).join('')}</ul>
</div>
</body>
</html>`;
}
