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
  kind: 'PDF Document' | 'Markdown' | 'Spreadsheet' | 'Image';
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
    name: "Alex Vance",
    role: "Lead Digital Transformer",
    company: "Apex Global Enterprise",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
    workstation: "Alex's MacBook Pro (Brained OS v3.2)",
  },
  streakDays: 7,
  xp: 1450,
  trustScore: 84,
  currentDay: 3,
  totalDays: 10,
  dockBadges: {
    inbox: 3,
    slack: 5,
    notes: 1,
    calendar: 2,
    teams: 1,
  }
};

export const INITIAL_NOTIFICATIONS: OSNotification[] = [
  {
    id: "notif-teams-1",
    app: "Teams",
    title: "Microsoft Teams • Incoming Video Call",
    subtitle: "Marcus (CTO)",
    body: "Project Titan Kickoff Briefing — Please join immediately.",
    timestamp: "Just now",
    actionText: "Accept Call",
    onActionAppId: "teams",
    isCall: true,
  },
  {
    id: "notif-slack-1",
    app: "Slack",
    title: "Slack • #hr-portal-transformation",
    subtitle: "Daniel (Business Head)",
    body: "Need clarification: Should the payroll SSO integration use OAuth2 PKCE or JWT tokens?",
    timestamp: "2m ago",
    actionText: "Reply on Slack",
    onActionAppId: "slack",
  },
  {
    id: "notif-sec-1",
    app: "Security",
    title: "Brained OS Security Sentinel",
    subtitle: "Olivia (InfoSec Lead)",
    body: "CRITICAL: Audit scan flagged zero-trust authentication vulnerability in proposed SDK.",
    timestamp: "10m ago",
    actionText: "Review Security Report",
    onActionAppId: "documents",
  }
];

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
    title: "Executive Steering Committee Standup",
    time: "09:00 AM - 09:30 AM",
    day: "Today",
    location: "Microsoft Teams (Live)",
    organizer: "Marcus Boss (CTO)",
    attendees: ["Marcus Boss (CTO)", "Elena Marshal (CHRO)", "David Knox (CISO)", "Alex Vance"],
    category: "Executive",
    meetingLinkAvailable: true,
  },
  {
    id: "cal-2",
    title: "InfoSec Zero-Trust OAuth Gate Review",
    time: "11:30 AM - 12:15 PM",
    day: "Today",
    location: "Conference Room 4B / Teams",
    organizer: "David Knox (CISO)",
    attendees: ["David Knox (CISO)", "Tariq Dev", "Alex Vance"],
    category: "Security",
    meetingLinkAvailable: true,
  },
  {
    id: "cal-3",
    title: "Payroll API Microservice Architectural Review",
    time: "02:00 PM - 03:00 PM",
    day: "Today",
    location: "Microsoft Teams",
    organizer: "Tariq Dev",
    attendees: ["Missy Chen (VP Finance)", "Tariq Dev", "Alex Vance"],
    category: "Engineering",
    meetingLinkAvailable: false,
  }
];

export const OS_FINDER_FILES: FinderFile[] = [
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
