# Brained: The Transformation Room — Complete Game Timeline
## Project Titan Scenario — Second-by-Second Reference

---

## Time Mapping

| Real Time | In-Game |
|-----------|---------|
| 60 real seconds | = 1 in-game day |
| 15 real minutes (900s) | = 15 in-game days |
| 1 real second | = 24 in-game minutes |
| Board Deadline: Day 14 = 840 real seconds = 14 min |

**In-game start:** 09:00 on Day 1  
**In-game clock speed:** each real second = 24 in-game minutes

---

## Second-by-Second Event Map

| Real (s) | Real Clock | In-Game Day | In-Game Time | Event | Channel | Trigger Type | Rule ID |
|----------|------------|-------------|--------------|-------|---------|--------------|---------|
| 0 | 0:00 | Day 1 | 09:00 | Session created. OS boots. Clock paused. | System | always | `session_start` |
| 3 | 0:03 | Day 1 | 09:01 | Boot animation completes. Desktop loads. | OS | always | `desktop_ready` |
| 7 | 0:07 | Day 1 | 09:03 | Teams incoming call notification fires: Marcus Reed (CTO). Sound plays. | Notification | always | `kickoff_notification` |
| 10 | 0:10 | Day 1 | 09:04 | Player joins kickoff. Camera permission requested. Clock starts on desktop (clock shown but not yet ticking for events). | Teams | player_action | `kickoff_start` |
| 10–40 | 0:10–0:40 | Day 1 | 09:04–09:16 | Kickoff meeting script plays. 26 lines across Marcus, Daniel, Emma, Sophia. Hidden reqs (Bulk Upload, Audit Logs) deliberately absent. | Teams | scripted | `kickoff_script` |
| ~40 | 0:40 | Day 1 | 09:16 | Kickoff meeting ends. Camera/mic state saved to GameContext. `setKickoffDone()` called. Simulation clock starts. | Teams | scripted | `kickoff_end` |
| 43 | 0:43 | Day 1 | 09:17 | Post-meeting prompt appears: "Would you like to document the Meeting Minutes?" [Open Notes] [Later] | Notification | always | `mom_prompt` |
| 45 | 0:45 | Day 1 | 09:18 | **MAIL**: Daniel sends Project Brief mail. Subject: "Project Titan — Transformation Brief & Immediate Next Steps". Contains full PDF. | Mail | always | `daniel_brief_mail` |
| 50 | 0:50 | Day 1 | 09:20 | **TEAMS DM** (Daniel): "I've sent you the project brief. Don't hesitate to ask if anything is unclear. You're leading the transformation workstream, so I want you to make the calls." | Teams | always | `daniel_mandate_dm` |
| 60 | 1:00 | Day 1 | 09:24 | **MAIL** (Emma): Employee Survey — Initial Findings. Contains employee pain points including document upload hint (req_document_upload). | Mail | always | `emma_survey_mail` |
| 90 | 1:30 | Day 1 | 09:36 | **SLACK DM** (Daniel): Payroll API constraint hint — "Payroll currently sits outside the HR platform. There are API constraints around that integration." → `discoverRequirement('req_payroll')` when read. | Slack | always | `daniel_payroll_slack` |
| 100 | 1:40 | Day 1 | 09:40 | **SLACK DM** (Aarav): "Welcome to Project Titan. Happy to answer questions if you get stuck. Good consultants discover requirements, they don't wait to be handed them." | Slack | always | `aarav_welcome_slack` |
| 120 | 2:00 | Day 2 | 09:00 | **CALENDAR**: Prototype Review event added. Day 7, 10:00. Participants: Player, Daniel, Marcus, Emma, Sophia. | Calendar | always | `calendar_prototype_review` |
| 140 | 2:20 | Day 2 | 09:48 | **CONDITIONAL**: If player has sent 0 messages → Daniel DM: "Quick check — how are we progressing?" Else if player active → Daniel DM: "Saw you've started working through the requirements. Keep the momentum going." | Teams | conditional | `daniel_day2_checkin` |
| 150 | 2:30 | Day 2 | 12:00 | **CONDITIONAL**: If IDE not yet opened and player inactive → Aarav nudge: "Have you looked at the prototype workspace? It would help to at least explore the project structure early." | Slack | conditional | `aarav_ide_nudge` |
| 180 | 3:00 | Day 2 | 15:00 | (Clock: Day 2 afternoon. General open-play window. Player free to explore everything.) | — | — | — |
| 200 | 3:20 | Day 3 | 09:00 | **CONDITIONAL**: If `stakeholderContacted.olivia` is false → Marcus DM: "Have you spoken with InfoSec yet? Security shouldn't be something we discover at the end." Else → "Good. Keep the security assumptions documented." | Teams | conditional | `cto_security_nudge` |
| 210 | 3:30 | Day 3 | 12:00 | **CALENDAR**: Board Presentation (Day 14) added to calendar. | Calendar | always | `calendar_board_event` |
| 240 | 4:00 | Day 4 | 09:00 | **MAIL** (Emma): Amendment — Employee Document Upload required. "One requirement was missed in the initial scope. Employees need to upload supporting documents when submitting certain HR requests." → `discoverRequirement('req_document_upload')` on read. | Mail | conditional | `emma_document_upload_mail` |
| 255 | 4:15 | Day 4 | 12:36 | **CONDITIONAL**: If player read Emma's mail and hasn't messaged Emma → Emma DM: "Did you see my email about document uploads? It's particularly important for leave-related workflows." | Teams | conditional | `emma_upload_followup` |
| 270 | 4:30 | Day 4 | 15:00 | **SLACK** (Emma, #project-titan): "One more thing from the plant HR team — a lot of employees access HR services from shared terminals. Keep the workflow simple." (UX req hint) | Slack | always | `emma_plant_hr_slack` |
| 300 | 5:00 | Day 5 | 09:00 | (Clock: Day 5 — prototype deadline approaching. Players who haven't built the prototype begin feeling deadline pressure.) | — | — | — |
| 330 | 5:30 | Day 5 | 16:12 | **CONDITIONAL**: If `prototypeBuilt` is false → Daniel DM: "Prototype review is Day 7. Are you tracking to have something ready?" | Teams | conditional | `daniel_prototype_reminder` |
| 360 | 6:00 | Day 6 | 09:00 | **MAIL** (Sophia): "I'd like to see where we're landing with the portal before the prototype review. The main thing I'm interested in is whether the employee experience is actually simpler." (Client pressure) | Mail | always | `sophia_client_pressure` |
| 390 | 6:30 | Day 6 | 16:12 | **CONDITIONAL**: If `prototypeBuilt` is false and IDE opened → Aarav: "It's Day 6. The prototype review is tomorrow. You'll want to have something to show." | Slack | conditional | `aarav_day6_pressure` |
| 420 | 7:00 | Day 7 | 09:00 | **🔔 NOTIFICATION**: "Prototype Review — starting in 10 minutes. Marcus, Daniel, Emma, Sophia waiting." | Notification | always | `prototype_review_reminder` |
| 430 | 7:10 | Day 7 | 10:00 | **CALENDAR NOTIFICATION**: Prototype Review now (if player hasn't joined yet). | Calendar | always | `prototype_review_now` |
| 470 | 7:50 | Day 7 | 19:12 | **CONDITIONAL**: If prototype review not attended → Daniel: "The review passed without you. This is being noted. Make sure it doesn't happen again before the board presentation." | Teams | conditional | `prototype_review_missed` |
| 480 | 8:00 | Day 8 | 09:00 | **CONDITIONAL**: If `prototypeBuilt` is true → Olivia mail: "HR Portal — Security Review Required. I need clarity on authentication, role-based access and auditability." → `discoverRequirement('req_audit_logs')` on read. | Mail | conditional | `olivia_security_review` |
| 510 | 8:30 | Day 8 | 16:12 | **CONDITIONAL**: If Sophia's Day 6 mail was ignored → Sophia DM: "I asked about the prototype direction a couple of days ago. I'd still like a status update." | Teams | conditional | `sophia_followup` |
| 540 | 9:00 | Day 9 | 09:00 | **SLACK** (Marcus, #project-titan): "I need the architecture documented. Not just the screens. Show me how authentication, roles, data and integrations fit together." | Slack | always | `marcus_arch_chase` |
| 570 | 9:30 | Day 9 | 16:12 | **CONDITIONAL**: If prototype quality score < 50% → Sophia DM: "I haven't seen enough progress on the employee workflow. Can you give me a realistic view of what's going to be ready?" Else → "The prototype is moving in the right direction. For the final presentation, focus on business impact." | Teams | conditional | `sophia_day9_conditional` |
| 600 | 10:00 | Day 10 | 09:00 | **CONDITIONAL**: If `req_rbac` not in prototype → Olivia mail: "Reminder — Role-based access isn't optional. Employees, managers and HR administrators should not have the same permissions." | Mail | conditional | `olivia_rbac_reminder` |
| 630 | 10:30 | Day 10 | 16:12 | **CONDITIONAL**: If `req_bulk_import` not discovered → Emma Slack: "One thing we haven't discussed — Titan is onboarding 200+ new employees next month. CSV bulk import would save HR enormous time." → `discoverRequirement('req_bulk_import')` on read. | Slack | conditional | `emma_bulk_import_hint` |
| 660 | 11:00 | Day 11 | 09:00 | **CALENDAR**: Final Client Presentation (Day 14) reminder added. | Calendar | always | `calendar_final_presentation` |
| 690 | 11:30 | Day 11 | 16:12 | **SLACK** (Aarav): "How are you feeling about the presentation? If you haven't reviewed your notes and the prototype together, now's a good time." | Slack | always | `aarav_day11_guidance` |
| 720 | 12:00 | Day 12 | 09:00 | **CONDITIONAL**: If MOM not submitted → Daniel DM: "We've noticed there's no MOM on file for the kickoff. That's a gap — documentation matters in consulting." | Teams | conditional | `mom_late_nudge` |
| 750 | 12:30 | Day 12 | 16:12 | (Open period. Player prepares for final presentation. Can review all apps, messages, documents.) | — | — | — |
| 780 | 13:00 | Day 13 | 09:00 | **SLACK** (Daniel, #project-titan): "Board expects to see the full transformation story, not just screens. Make sure you can speak to the business impact, the decisions you made, and any outstanding risks." | Slack | always | `daniel_day13_guidance` |
| 800 | 13:20 | Day 13 | 13:48 | **MAIL** (Marcus): "Tomorrow is Day 14. The board includes Sophia, myself, Daniel, Emma, and Olivia. Be ready to speak clearly and concisely. This is a business presentation, not a technical demo." | Mail | always | `marcus_day13_prep_mail` |
| 820 | 13:40 | Day 13 | 17:36 | **NOTIFICATION**: Final Presentation — tomorrow. Reminder with participant list. | Notification | always | `final_presentation_reminder` |
| 840 | 14:00 | Day 14 | 09:00 | **🔴 DEADLINE** — Clock turns red. Teams incoming call fires: "Project Titan — Final Client Presentation". | Notification | always | `final_presentation_call` |
| 855 | 14:15 | Day 14 | 12:36 | Final Presentation meeting auto-starts if player accepts call. Camera requested. Recording begins. | Teams | player_action | `presentation_start` |
| 870 | 14:30 | Day 14 | 16:12 | Presentation closes. Recording stops. Audio extracted for Whisper. Evaluation queued. | System | automatic | `presentation_end` |
| 880 | 14:40 | Day 14 | 18:24 | Loading animation shown. "Evaluating your transformation…" | System | automatic | `evaluation_start` |
| 900 | 15:00 | Day 15 | 09:00 | **SESSION CLOSES**. Final report generated. Outcome displayed (not a score — a narrative). | System | automatic | `session_end` |

---

## Conditional Event Logic

Events marked `conditional` fire only when both conditions are met:
1. **Time condition** (real seconds elapsed)
2. **State condition** (World State check)

Example: `olivia_security_review` fires at 480s **AND** `prototypeBuilt === true`. If the player never runs the prototype, Olivia's mail never sends.

### State flags checked

| Flag | Set when |
|------|----------|
| `meetingState.kickoffDone` | Kickoff meeting ended |
| `meetingState.momSubmitted` | Player clicked "Submit as MOM" |
| `prototypeBuilt` | Player clicked "Build Prototype" |
| `discoveredRequirements.has('req_payroll')` | Player read Daniel's Slack DM |
| `discoveredRequirements.has('req_document_upload')` | Player read Emma's mail or survey |
| `discoveredRequirements.has('req_audit_logs')` | Player read Olivia's security mail |
| `discoveredRequirements.has('req_bulk_import')` | Player read Emma's Day 10 Slack |
| `stakeholderContacted.olivia` | Player sent any message to Olivia |
| `stakeholderContacted.daniel` | Player sent any message to Daniel |

---

## Whisper Integration Guide

### Option A — OpenAI Whisper (recommended, requires key)
```env
WHISPER_PROVIDER=openai
OPENAI_API_KEY=sk-...
```
The presentation recording (`audio.webm`) is sent to `POST /v1/audio/transcriptions` on the OpenAI API.  
Model: `whisper-1`. Returns plain text transcript.

### Option B — Groq Whisper (faster, free tier available)
```env
WHISPER_PROVIDER=groq
GROQ_API_KEY=gsk_...
```
Uses Groq's hosted Whisper endpoint (`POST https://api.groq.com/openai/v1/audio/transcriptions`).  
Model: `whisper-large-v3`. Typically 5–10× faster than OpenAI.

### Option C — Local (no API key required, for development)
Run `faster-whisper` locally:
```bash
pip install faster-whisper
# In server/game/presentation/presentation.service.ts — set WHISPER_PROVIDER=local
```
Note: Local Whisper requires a GPU or will run slowly on CPU. Recommended for development only.

### Recording flow
```
Player speaks (browser MediaRecorder API)
  ↓
Audio blob collected on "Stop Recording"
  ↓
POST /api/game/presentation/upload (multipart/form-data)
  ↓
storage.service.ts saves to /uploads/ or S3
  ↓
presentation.service.ts calls whisperClient.audio.transcriptions.create()
  ↓
Transcript returned → LLM evaluation against World State
  ↓
Final report generated
```

---

## Required Environment Variables

### Backend (`server/.env` or `/.env`)

```env
# ── Core ──────────────────────────────────────────────────────
PORT=4000
NODE_ENV=development

# ── MongoDB (World State persistence) ─────────────────────────
MONGODB_URI=mongodb://localhost:27017
# Production: mongodb+srv://user:pass@cluster.mongodb.net/brained

# ── Redis (event scheduler + hot cache) ───────────────────────
REDIS_URL=redis://localhost:6379
# Production: rediss://default:TOKEN@hostname.upstash.io:6380

# ── Grok / xAI (character AI, MOM eval, report generation) ────
XAI_API_KEY=xai-your-key-here
LLM_BASE_URL=https://api.x.ai/v1
LLM_MODEL=grok-3          # or grok-2 (cheaper/faster)

# Fallback to OpenAI if no XAI key:
# OPENAI_API_KEY=sk-...
# LLM_BASE_URL=https://api.openai.com/v1
# LLM_MODEL=gpt-4o

# ── Whisper (presentation transcription) ──────────────────────
WHISPER_PROVIDER=openai   # 'openai' | 'groq' | 'local'
OPENAI_API_KEY=sk-...     # Required if WHISPER_PROVIDER=openai

# Groq option (free tier):
# WHISPER_PROVIDER=groq
# GROQ_API_KEY=gsk_...

# ── File Storage (presentation recordings, PDFs) ──────────────
STORAGE_ADAPTER=local     # 'local' | 's3'
# S3 (production):
# STORAGE_ADAPTER=s3
# S3_BUCKET=brained-recordings
# AWS_REGION=us-east-1
# AWS_ACCESS_KEY_ID=...
# AWS_SECRET_ACCESS_KEY=...

# ── Auth (existing Google OAuth) ──────────────────────────────
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
JWT_SECRET=your-jwt-secret-here
```

### Frontend (`/.env` or `/.env.local`)

```env
# ── Backend connection ─────────────────────────────────────────
VITE_API_URL=http://localhost:4000
VITE_WS_URL=http://localhost:4000

# ── Google OAuth (existing) ───────────────────────────────────
VITE_GOOGLE_CLIENT_ID=...
```

### Minimum to run the full game

| Service | Variable | Purpose |
|---------|----------|---------|
| **Required** | `XAI_API_KEY` | Character replies, MOM eval, report generation |
| **Required** | `MONGODB_URI` | Save sessions, World State, evaluation results |
| **Required** | `REDIS_URL` | Event scheduler, hot cache |
| Optional | `OPENAI_API_KEY` / `GROQ_API_KEY` | Presentation Whisper transcription |
| Optional | `GOOGLE_CLIENT_ID` | Existing login flow |
| Optional | `S3_BUCKET` etc. | Recording storage in production |

> **Note:** If MongoDB or Redis are unavailable, the game degrades gracefully:
> - Without Redis: event timers use backend in-memory fallback (sessions lost on restart)
> - Without Mongo: World State is Redis-only (lost on Redis restart)
> - Without XAI/OpenAI key: character messages return a fallback response, MOM evaluation skipped, report is template-generated
> - The frontend game works completely standalone without any backend if needed (GameContext drives all frontend state)

---

## Key Player Behaviours Tracked (Invisible to Player)

| Behaviour | Dimension | Value |
|-----------|-----------|-------|
| Camera ON during kickoff | Communication | +10 |
| Camera OFF during kickoff | Communication | −5 |
| MOM submitted with >200 chars | Documentation | +15 |
| MOM submitted with <50 chars | Documentation | +2 |
| MOM not submitted | Documentation | −10 |
| Opened IDE (any time) | Delivery Management | +5 |
| Built prototype before Day 7 | Delivery Management | +12 |
| Built prototype after Day 7 | Delivery Management | +5 |
| Prototype never built | Delivery Management | −15 |
| Contacted Olivia proactively | Security Awareness | +12 |
| Contacted Olivia after Marcus nudge | Security Awareness | +5 |
| Never contacted Olivia | Security Awareness | −10 |
| Discovered req_payroll | Requirement Management | +8 |
| Discovered req_document_upload | Requirement Management | +8 |
| Discovered req_audit_logs | Requirement Management | +8 |
| Discovered req_bulk_import | Requirement Management | +8 |
| Included document_upload in prototype | Delivery Management | +10 |
| Presentation camera ON | Communication | +10 |
| Presentation references correct reqs | Presentation | up to +30 |
| Presentation claims something not in World State | Presentation | −15 per claim |
| Messaged each stakeholder at least once | Stakeholder Management | +6 per person |
| Sent message to Daniel | Stakeholder Management | +6 |
| Sent message to Sophia | Stakeholder Management | +6 |
| Read Emma's survey mail | Business Understanding | +5 |
| Read Sophia's client pressure mail | Client Awareness | +5 |
