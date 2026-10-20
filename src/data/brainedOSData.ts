export interface OSNotification {
  id: string;
  app: 'Teams' | 'Slack' | 'Mail' | 'Calendar' | 'Security';
  title: string;
  subtitle?: string;
  body: string;
  timestamp: string;
  actionText?: string;
  onActionAppId?: string;
  isCall?: boolean;
  read?: boolean;
  missed?: boolean;
}

export interface MailItem {
  id: string;
  sender: string;
  senderRole: string;
  senderAvatar: string;
  email: string;
  subject: string;
  preview: string;
  body: string;
  timestamp: string;
  read: boolean;
  starred: boolean;
  priority: 'High' | 'Normal' | 'Low';
  folder: 'Inbox' | 'Sent' | 'Drafts' | 'Archive';
  attachment?: { name: string; size: string; type: string };
}

export interface NoteItem {
  id: string;
  title: string;
  folder: 'All Notes' | 'Project Titan' | 'MOM Archive' | 'Ideas';
  pinned: boolean;
  lastModified: string;
  content: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  day: string;
  location: string;
  organizer: string;
  attendees: string[];
  category: 'Executive' | 'Engineering' | 'Security' | 'UAT';
  meetingLinkAvailable?: boolean;
}

export interface FinderFile {
  id: string;
  name: string;
  path: string;
  folder: 'Documents' | 'Downloads' | 'Projects' | 'Desktop';
  size: string;
  kind: 'PDF Document' | 'Markdown' | 'Spreadsheet' | 'Image' | 'Zip Archive' | 'TypeScript Source' | 'JSON Config';
  lastModified: string;
  content: string;
}

export interface BrowserTab {
  id: string;
  title: string;
  url: string;
  icon: string;
  content: {
    heading: string;
    subheading: string;
    body: string;
    metrics?: { label: string; value: string }[];
  };
}

export const INITIAL_OS_STATE = {
  user: {
    name: "Consultant",
    role: "Digital Transformer",
    company: "Enterprise Systems",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
    workstation: "Brained OS Workstation",
  },
  streakDays: 1,
  xp: 100,
  trustScore: 100,
  currentDay: 1,
  totalDays: 12,
  dockBadges: {
    inbox: 0,
    slack: 0,
    notes: 0,
    calendar: 0,
    teams: 0,
  }
};

export const INITIAL_NOTIFICATIONS: OSNotification[] = [];

export const OS_MAILS: MailItem[] = [
  {
    id: "mail-1",
    sender: "Olivia",
    senderRole: "Information Security Lead",
    senderAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250",
    email: "olivia@brained.com",
    subject: "URGENT: Zero-Trust OAuth Gate Block for Project Titan",
    preview: "Our automated vulnerability scan picked up critical audit flags on the proposed third-party OAuth provider...",
    body: `Alex,\n\nOur security intelligence team completed the automated vulnerability assessment on the proposed HR Portal authentication architecture.\n\nKey Findings:\n1. The current OAuth token lifetime (60 mins) violates Apex Zero-Trust standard (max 15 mins).\n2. Missing Vault KMS payload encryption headers.\n\nPlease update the architecture specification document in Notion and re-submit for InfoSec approval before sprint 2 backend deployment.\n\nRegards,\nOlivia\nInfoSec Division`,
    timestamp: "09:42 AM",
    read: false,
    starred: true,
    priority: "High",
    folder: "Inbox",
    attachment: { name: "InfoSec_Audit_Report_v2.pdf", size: "2.4 MB", type: "PDF" }
  },
  {
    id: "mail-2",
    sender: "Emma",
    senderRole: "HR Director",
    senderAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250",
    email: "emma@brained.com",
    subject: "RE: Onboarding Self-Service User Journey Feedback",
    preview: "The regional HR directors reviewed the initial wireframe specs and loved the self-service flow...",
    body: `Hi Alex,\n\nFantastic job leading yesterday's kickoff call! The regional HR directors loved the interactive self-service portal roadmap.\n\nCould we add a quick video welcome greeting component for new hires on day 1?\n\nBest regards,\nEmma\nHR Director`,
    timestamp: "08:15 AM",
    read: false,
    starred: false,
    priority: "Normal",
    folder: "Inbox"
  },
  {
    id: "mail-3",
    sender: "Marcus",
    senderRole: "Chief Technology Officer",
    senderAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
    email: "marcus@brained.com",
    subject: "Steering Committee MOM & RAID Log Signoff",
    preview: "Make sure all action items from the executive kickoff are assigned in Jira...",
    body: `Alex,\n\nPlease compile the official Minutes of Meeting (MOM) for our executive board archive. We need full alignment across engineering, HR, and InfoSec before the week 2 sprint planning.\n\nKeep pushing,\nMarcus`,
    timestamp: "Yesterday",
    read: true,
    starred: false,
    priority: "High",
    folder: "Inbox"
  }
];

export const OS_NOTES: NoteItem[] = [
  {
    id: "note-1",
    title: "Executive Steering MOM — Day 3",
    folder: "MOM Archive",
    pinned: true,
    lastModified: "10:15 AM",
    content: `# Executive Steering Meeting Minutes (MOM)

**Date**: Day 3 of 10
**Chair**: Alex Vance (Lead Transformer)
**Attendees**: Marcus Boss (CTO), Elena Marshal (CHRO), David Knox (CISO), Missy Chen (VP Finance)

### Key Decisions:
1. Approved modular microservice framework for HR Portal backend.
2. Agreed to 15-minute OAuth JWT token expiry to satisfy CISO zero-trust mandate.
3. Postponed live streaming welcome video hub to V2 release window to preserve timeline.

### Action Items:
- [ ] Alex Vance: Publish final RACI governance matrix in Notion docs.
- [ ] Tariq Dev: Submit zero-trust encryption schema to CISO Knox by EOD.
- [ ] Elena Marshal: Schedule UAT testing scenarios with regional HR leads.`
  },
  {
    id: "note-2",
    title: "Project Titan Charter & Objectives",
    folder: "Project Titan",
    pinned: true,
    lastModified: "Yesterday",
    content: `# Project Titan Charter

Apex Global Enterprise is modernizing its legacy HR ecosystem within a 6-week execution window.

## Key Performance Indicators (KPIs)
- **KPI 1**: Reduce onboarding lead-time from 14 days to under 48 hours.
- **KPI 2**: Achieve 100% Zero-Trust SOC2 compliance across 14 office locations.
- **KPI 3**: Automate 80% of routine HR service desk requests via conversational AI agents.`
  }
];

export const OS_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: "cal-1",
    title: "Digital Transformation Roadmap Review",
    time: "10:00 AM - 11:00 AM",
    day: "Today",
    location: "Enterprise Boardroom",
    organizer: "Digital Transformation Office",
    attendees: ["Strategy Team"],
    category: "Executive",
    meetingLinkAvailable: false,
  }
];

export const OS_FINDER_FILES: FinderFile[] = [
  {
    id: "file-titan-folder",
    name: "titan-hr-portal-prototype.zip",
    path: "/Desktop/Project Titan Code",
    folder: "Desktop",
    size: "1.2 MB",
    kind: "Zip Archive",
    lastModified: "Just now",
    content: "Full source code package for Project Titan HR Portal. Contains Next.js 14 codebase, package.json, App.tsx, SSOAuth.tsx, LeaveManagement.tsx, and README.md."
  },
  {
    id: "file-titan-app-tsx",
    name: "App.tsx",
    path: "/Projects/titan-hr-portal/src",
    folder: "Projects",
    size: "4.2 KB",
    kind: "TypeScript Source",
    lastModified: "Just now",
    content: `import React from 'react';
import { SSOAuth } from './components/SSOAuth';
import { LeaveManagement } from './components/LeaveManagement';
import { Directory } from './components/Directory';

export default function TitanHRPortal() {
  return (
    <div className="p-8 bg-slate-950 text-white font-sans">
      <h1 className="text-2xl font-bold text-sky-400">Titan Enterprise HR Portal</h1>
      <SSOAuth />
      <LeaveManagement />
      <Directory />
    </div>
  );
}`
  },
  {
    id: "file-titan-package-json",
    name: "package.json",
    path: "/Projects/titan-hr-portal",
    folder: "Projects",
    size: "820 B",
    kind: "JSON Config",
    lastModified: "Just now",
    content: `{
  "name": "titan-hr-portal-prototype",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "@titan/design-system": "^2.1.4"
  }
}`
  },
  {
    id: "file-1",
    name: "Enterprise_HR_Portal_Charter.pdf",
    path: "/Projects/Titan/Docs",
    folder: "Projects",
    size: "3.4 MB",
    kind: "PDF Document",
    lastModified: "Today at 08:30 AM",
    content: "Official Project Charter approved by Marcus Boss (CTO) and Elena Marshal (CHRO). Scope: 6-Week HR Portal overhaul."
  },
  {
    id: "file-2",
    name: "RACI_Governance_Matrix.md",
    path: "/Documents/Governance",
    folder: "Documents",
    size: "142 KB",
    kind: "Markdown",
    lastModified: "Yesterday",
    content: "RACI Matrix detailing Accountable, Responsible, Consulted, and Informed roles across C-Suite members."
  },
  {
    id: "file-3",
    name: "InfoSec_SOC2_Compliance_Audit.pdf",
    path: "/Downloads",
    folder: "Downloads",
    size: "5.1 MB",
    kind: "PDF Document",
    lastModified: "2 hours ago",
    content: "SOC2 Compliance evaluation report submitted by CISO David Knox flagging OAuth token lifetime flags."
  },
  {
    id: "file-internal-brief-pdf",
    name: "Project_Amigo_Internal_Brief.pdf",
    path: "/Downloads/Project_Amigo_Internal_Brief.pdf",
    folder: "Downloads",
    size: "185 KB",
    kind: "PDF Document",
    lastModified: "Just now",
    content: `PROJECT AMIGO\nInternal Project Brief\n\nPrepared by: Aarav Kapoor, Project Manager\nProject: ICICI Bank HRMS Modernization\nDocument status: Internal — Initial Discovery\nDate: Project Day 1\n\n1. Business Context\n\nICICI Bank plans to modernize the HRMS experience for approximately 80,000 employees across India.\n\nThe initiative is expected to simplify everyday employee activities, reduce manual HR processes, and provide a more consistent digital experience across the organization.\n\nThe business is working towards a 90-day delivery window ahead of the annual appraisal cycle.\n\n2. What the Business Needs\n\nThe initial request covers multiple capabilities, including performance appraisals, attendance, leave management, employee tax documents, learning management, and digital employee profiles.\n\nThe business expects the solution to be useful during the appraisal period, when employees and managers will need reliable access to performance-related workflows.\n\nThe complete list of requested modules and detailed requirements will be shared separately.\n\n3. Points to Keep in Mind\n\nBusiness continuity\nThe appraisal cycle is a fixed business event. Delays affecting essential employee and manager workflows could have a direct business impact.\n\nExpected usage\nThe kickoff discussion raised the possibility of approximately 30,000 concurrent logins during peak periods. This estimate needs to be validated, and the technical approach must be assessed against the expected demand.\n\nSystem access\nThe team has not yet confirmed access to the LDAP sandbox. This may affect authentication integration and end-to-end testing.\n\n4. Before We Commit\n\nThe project team still needs to establish which capabilities deserve early attention, which technical dependencies require action, and whether the proposed delivery window is achievable.\n\nInitial priorities should reflect business needs, not simply the order in which requirements were received.\n\nInternal note: This brief captures the current understanding of the project. Scope, architecture, dependencies, and delivery dates remain subject to validation and stakeholder approval.\n\nProject Amigo | Internal Working Document`
  },
  {
    id: "file-proto-appraisal",
    name: "Appraisal_Dashboard_v1.pdf",
    path: "/Documents/Prototypes/Appraisal_Dashboard_v1.pdf",
    folder: "Documents",
    size: "420 KB",
    kind: "PDF Document",
    lastModified: "Today at 09:15 AM",
    content: "PROJECT AMIGO — High-Fidelity Prototype Export\nComponent: Appraisal Dashboard (v1.0 Baseline)\nReviewed & Approved by Marcus Reed (CTO)\nFeatures: KPI goal weighting, competency matrix, and 1-click rating submission for managers."
  },
  {
    id: "file-proto-leave",
    name: "Leave_Request_Screen_v1.pdf",
    path: "/Documents/Prototypes/Leave_Request_Screen_v1.pdf",
    folder: "Documents",
    size: "310 KB",
    kind: "PDF Document",
    lastModified: "Today at 09:15 AM",
    content: "PROJECT AMIGO — High-Fidelity Prototype Export\nComponent: Leave Request Screen (v1.0 Baseline)\nReviewed & Approved by Marcus Reed (CTO)\nFeatures: Live balances (Privilege, Casual, Sick), calendar sync, automated holiday exclusion, and instant manager approvals."
  },
  {
    id: "file-proto-form16",
    name: "Form16_Downloader_v1.pdf",
    path: "/Documents/Prototypes/Form16_Downloader_v1.pdf",
    folder: "Documents",
    size: "280 KB",
    kind: "PDF Document",
    lastModified: "Today at 09:15 AM",
    content: "PROJECT AMIGO — High-Fidelity Prototype Export\nComponent: Form 16 Downloader (v1.0 Baseline)\nReviewed & Approved by Marcus Reed (CTO)\nFeatures: Assessment year selector (FY 2024-25), digital e-signature verification status, and password-protected PDF export."
  }
];

export const OS_BROWSER_TABS: BrowserTab[] = [
  {
    id: "tab-aws",
    title: "AWS Cloud Console — Apex VPC",
    url: "https://console.aws.amazon.com/vpc/home?region=us-east-1",
    icon: "Cloud",
    content: {
      heading: "AWS Cloud Infrastructure — HR Portal Cluster",
      subheading: "Cluster Health: 100% Operational | 14 Microservices Active",
      body: "VPC Region: us-east-1 (N. Virginia)\nLoad Balancer: Active (45ms avg response latency)\nECS Tasks: 12 Running | Auto-scaling target: 80% CPU",
      metrics: [
        { label: "Uptime", value: "99.99%" },
        { label: "Active Nodes", value: "14/14" },
        { label: "Network IO", value: "1.2 GB/s" }
      ]
    }
  },
  {
    id: "tab-confluence",
    title: "Confluence Wiki — Project Titan Knowledge Base",
    url: "https://apexglobal.atlassian.net/wiki/spaces/TITAN/pages/overview",
    icon: "BookOpen",
    content: {
      heading: "Project Titan — Digital Transformation Architecture Wiki",
      subheading: "Maintained by Digital Transformation Practice Lead",
      body: "Welcome to the central repository for the Enterprise HR Portal overhaul. Contains API swagger documentation, security guidelines, and regional deployment timelines."
    }
  },
  {
    id: "tab-vendor",
    title: "Okta / Auth0 Vendor Trust Portal",
    url: "https://trust.vendor-auth.com/apex-audit-2026",
    icon: "Shield",
    content: {
      heading: "Vendor SOC2 Type II Certification Portal",
      subheading: "Verified Trust Status: Certified",
      body: "All Zero-Trust encryption payload specs compliant with ISO 27001 & SOC2 standards."
    }
  }
];
