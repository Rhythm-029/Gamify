# Chapter 1 Meeting Dialogue Audio Guide

This folder (`public/audio/chapter1/`) contains or receives the generated audio files for **Chapter 1: The Briefing (Project Amigo Kickoff Meeting & Post-Meeting Briefing)**.

When audio files are placed here with the designated filenames, the meeting and Teams conversations will immediately play high-fidelity voices. If any audio file is absent, the game engine automatically falls back to native Web Speech synthesis.

---

## 🎙️ Master Dialogue Audio Generation List

| Filename | Speaker | Role | Tone & Voice Guide | Exact Transcript |
| :--- | :--- | :--- | :--- | :--- |
| `01_marcus_project_amigo.mp3` | **Marcus Reed** | CTO · Brained | Deep, executive, authoritative, measured British or American accent | *"This is Project Amigo: an HRMS transformation for 80,000 ICICI Bank employees."* |
| `02_sophia_deadline_demand.mp3` | **Sophia Bennett** | Head of HR Operations · ICICI Bank | Confident, polished banking client executive, firm, polite, direct | *"We need 12 HRMS modules, including appraisals, attendance and leave. The appraisal cycle opens in 90 days, and everything is expected to be ready before then."* |
| `03_marcus_feasibility_challenge.mp3` | **Marcus Reed** | CTO · Brained | Skeptical, analytical, firm technical pushback | *"Twelve modules in 90 days? We need to establish what's actually feasible before we commit."* |
| `04a_player_decision_a.mp3` | **Player (Consultant)** | Digital Transformation Lead | Over-eager, accommodating, eager to please without validation | *"We can deliver everything in 90 days. Let's work out the details as we go."* |
| `04b_player_decision_b.mp3` | **Player (Consultant)** | Digital Transformation Lead | Blunt, defensive, confrontational | *"If engineering says it isn't feasible, we need to reject the deadline."* |
| `04c_player_decision_c.mp3` | **Player (Consultant)** | Digital Transformation Lead | Calm, master consultant, diplomatic, highly authoritative | *"Let's validate the scope, capacity, peak load and dependencies before agreeing on a realistic delivery plan."* |
| `05_marcus_peak_traffic.mp3` | **Marcus Reed** | CTO · Brained | Technical gravity, architectural risk warning | *"Peak traffic could reach 30,000 simultaneous logins. We haven't validated whether the legacy system can handle it."* |
| `06_daniel_ldap_credentials.mp3` | **Daniel Brooks** | Program Manager · Brained | Operational urgency, pragmatic project manager | *"And we still lack the LDAP sandbox credentials needed to validate single sign-on end to end."* |
| `07_aarav_readme_instruction.mp3` | **Aarav Kapoor** | Senior Consultant · Brained | Composed, senior partner tone, mentoring, calm | *"DT, review ReadMe AI's minutes, correct what it missed, and submit the official record before we commit to a plan."* |
| `08_aarav_teams_briefing.mp3` | **Aarav Kapoor** | Senior Consultant · Brained | Supportive, strategic consultant audio note | *"Good work getting the meeting documented. We now have a clearer picture of what the client wants, but twelve modules in 90 days is going to need careful planning. Before the team starts building, I need your initial priorities. Review the scope-planning document and complete the assignment inside it before we move forward."* |
| `09_aarav_teams_feedback.mp3` | **Aarav Kapoor** | Senior Consultant · Brained | Approving, insightful senior feedback | *"Solid breakdown. Prioritizing Appraisals, Attendance, and Leave hits the critical path, and treating LDAP as an explicit dependency prevents premature blockages. You're ready to proceed to Chapter 2."* |

---

## ⚙️ Recommended Generation Settings (ElevenLabs / OpenAI TTS / FishAudio)

- **Marcus Reed (CTO)**: Deep male voice (e.g. *Marcus*, *Adam*, or *Brian* in ElevenLabs). Stability: `0.55`, Similarity: `0.75`.
- **Sophia Bennett (Client Lead)**: Professional corporate female voice (e.g. *Rachel*, *Sarah*, or *Priya*). Stability: `0.60`, Similarity: `0.80`.
- **Daniel Brooks (Program Manager)**: Practical, mid-range male voice (e.g. *Antoni*, *Josh*). Stability: `0.50`, Similarity: `0.75`.
- **Aarav Kapoor (Senior Consultant)**: Warm, articulate, calm senior male voice with slight international/Indian cadence (e.g. *Arnav*, *Kumar*, or *George*). Stability: `0.65`, Similarity: `0.80`.

Drop `.mp3` files directly into this directory (`public/audio/chapter1/`) and they will be immediately picked up by the game!
