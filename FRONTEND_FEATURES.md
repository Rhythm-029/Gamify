# Brained OS — Frontend Features Specification

**Brained OS** is an ultra-high fidelity **Virtual Operating System Workstation Simulator** designed for Digital Transformation training. Players do not interact with a standard SaaS dashboard; instead, they log into their company MacBook and experience digital transformation organically through an authentic operating system interface.

---

## 📊 Summary Overview

- **Total Frontend Features**: **24 Distinct Features**
- **Architecture**: React 18 + TypeScript + Vite + Tailwind CSS v4 + Framer Motion
- **Execution Model**: 100% Hardcoded Frontend Prototype (Zero backend, zero databases, zero external APIs)

---

## 💻 Categorized Feature List & Breakdown

### Category 1: Operating System Shell & Desktop Core (5 Features)

| # | Feature Name | Component | Technical Purpose |
|---|---|---|---|
| 1 | **Brained OS Workstation Canvas** | `BrainedOSDesktop.tsx` | Serves as the primary workstation environment featuring a high-resolution mountain scenery wallpaper (`wallpaper.png`), dark vignette overlay, and ambient lighting flares. |
| 2 | **Apple Glass Top Menu Bar** | `BrainedMenuBar.tsx` | A 44px (`h-11`) translucent frosted header (`backdrop-blur-2xl`) displaying the exact uploaded Brained logo, active app context label, standard system menus, Duolingo streak counter, XP, Trust %, Spotlight trigger, and digital clock. |
| 3 | **Floating Glass Dock Shelf** | `BrainedDock.tsx` | A magnified bottom macOS glass dock holding enlarged app icons (`52px`), unread notification count badges (`Mail 3`, `Teams 1`, `Slack 5`, `Notes 1`, `Calendar 2`), active dot indicators, and a Trash shortcut. |
| 4 | **Multi-Window Stack Manager** | `BrainedWindow.tsx` | Enables launching multiple floating, resizable, minimizable, and maximizable macOS windows over the wallpaper with authentic traffic light controls (🔴 `#FF5F56`, 🟡 `#FFBD2E`, 🟢 `#27C93F`). |
| 5 | **Spotlight Search Overlay (`⌘K`)** | `SpotlightSearch.tsx` | Global search overlay triggered via `⌘K` or top menu button, indexing files, emails, stakeholders, and applications with instant filtering. |

---

### Category 2: Narrative & Storytelling Engine (3 Features)

| # | Feature Name | Component | Technical Purpose |
|---|---|---|---|
| 6 | **Narrative Boot Toast Engine** | `OSNotificationCenter.tsx` | Automatically slides in a top-right macOS notification toast 3 seconds after boot, triggering an incoming Microsoft Teams video call from CTO Marcus Boss with audio chime indicators. |
| 7 | **Simulation Event Modal** | `SimulationEventModal.tsx` | Displays high-stakes C-Suite crisis decision popups that alter Executive Trust score (0-100%), grant Transformation XP, and update narrative outcomes. |
| 8 | **AI Director Mentor Widget** | `AIDirectorWidget.tsx` | A floating AI assistant modal offering strategic advice, stakeholder alignment tips, and recommended next workstation actions. |

---

### Category 3: Brained OS Application Clones (12 Features)

| # | Feature Name | Component | Technical Purpose |
|---|---|---|---|
| 9 | **Microsoft Teams Call & Hub** | `MSTeamsApp.tsx` | Simulates an in-meeting video conference room featuring CTO Marcus Boss, real-time speech subtitles, mic mute controls, and acceptance triggers to return to the workstation. |
| 10 | **Apple Mail (Priority Inbox)** | `AppleMailApp.tsx` | A 3-panel email client (Sidebar folders, Email List with priority tags, and Full Detail Preview with downloadable PDF audit attachments and quick reply composer). |
| 11 | **Apple Notes (MOM & Strategy)** | `AppleNotesApp.tsx` | A 3-panel note-taking client (Folder tree, Pinned notes, Executive MOM templates, Markdown editor, and one-click AI Auto-Enhancer). |
| 12 | **Apple Calendar** | `AppleCalendarApp.tsx` | Displays weekly workstation schedules, upcoming executive standups, meeting organizers, attendees, and one-click Teams join buttons. |
| 13 | **Slack HQ (Messenger)** | `SlackOSApp.tsx` | Channel switcher (`#hr-portal-transformation`, `#incidents-war-room`), direct messages, simulated live typing indicators, and emoji reaction triggers. |
| 14 | **Jira / Linear Kanban Board** | `JiraKanbanApp.tsx` | Interactive sprint 1 kanban board with drag-and-drop task cards, priority flags (`Critical`, `High`, `Normal`), assignees, and issue details. |
| 15 | **Arc Browser (Cloud Console)** | `FakeBrowserApp.tsx` | Tabbed browser rendering simulated live AWS Cloud Console VPC metrics, Confluence Wiki knowledge base, and Okta/Auth0 Vendor SOC2 Trust Portal. |
| 16 | **Apple Finder (File Explorer)** | `FinderApp.tsx` | Hierarchical file browser (`Documents`, `Downloads`, `Projects`) with file metadata, size specifications, and Quick Look content preview panels. |
| 17 | **Brained OS Terminal (CLI)** | `TerminalApp.tsx` | An interactive zsh command-line console supporting `help`, `status`, `infosec`, `trust`, and `clear` commands for technical auditing. |
| 18 | **Stakeholders Alignment Index** | `StakeholdersApp.tsx` | Interactive C-Suite executive profile cards (CTO, CHRO, CISO, VP Finance) displaying trust percentages, key concerns, and decision levers. |
| 19 | **Verified Executive Certificate** | `CertificateApp.tsx` | Printable Certificate of Transformation Mastery featuring digital signatures, verification seal, and QR verification badge. |
| 20 | **Global Leaderboard** | `LeaderboardApp.tsx` | Competitive ranking board tracking XP, streaks, and enterprise completion standings across all transformation leaders. |

---

### Category 4: Gamification & Workstation Widgets (4 Features)

| # | Feature Name | Component | Technical Purpose |
|---|---|---|---|
| 21 | **Duolingo Daily Streak Engine** | `BrainedMenuBar.tsx` | A prominent streak counter (`🔥 7 Day Streak`) encouraging daily consistency and engagement tracking. |
| 22 | **Executive Trust Metric Index** | `BrainedMenuBar.tsx` | A real-time executive alignment gauge (0-100%) that fluctuates dynamically based on player choices and stakeholder management. |
| 23 | **Transformation XP System** | `BrainedMenuBar.tsx` | Experience point accumulation system ranking players from *Junior Transformer* to *Principal Transformer*. |
| 24 | **macOS Time & Clock Widget** | `DesktopWidgets.tsx` | Desktop wallpaper widget featuring large digital time readout (`10:42 AM`), live date (`Thursday, July 30`), location (`Cupertino, CA`), and weather (`72°F Partly Cloudy`). |

---

## 🎯 Purpose of Brained OS Architecture

1. **Immersion First**: The user feels like they are operating a real company MacBook rather than viewing a static learning platform.
2. **Curiosity-Driven Gameplay**: Story events unfold through native OS notifications, unread email badges, and Slack messages, allowing players to decide what to investigate next.
3. **Enterprise Realism**: Demonstrates realistic corporate dynamics (CISO security concerns, CTO delivery timelines, CHRO user adoption) inside recognizable software tools.
