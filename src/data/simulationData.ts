export interface Stakeholder {
  id: string;
  name: string;
  role: string;
  avatar: string;
  trustLevel: number; // 0 to 100
  mood: 'Enthusiastic' | 'Skeptical' | 'Neutral' | 'Demanding' | 'Supportive' | 'Critical';
  status: 'Online' | 'In a Meeting' | 'Away' | 'Busy';
  pendingRequest?: string;
  recentQuote: string;
  influence: 'High' | 'Medium' | 'Critical';
  department: string;
  badgeCode: string;
}

export interface Email {
  id: string;
  sender: string;
  senderRole: string;
  senderAvatar: string;
  subject: string;
  snippet: string;
  body: string;
  timestamp: string;
  read: boolean;
  priority: 'High' | 'Medium' | 'Low';
  category: 'Directives' | 'Security' | 'Approvals' | 'Updates';
  attachment?: string;
}

export interface SlackMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  reactions?: { emoji: string; count: number; reacted?: boolean }[];
}

export interface SlackChannel {
  id: string;
  name: string;
  unreadCount: number;
  isPrivate?: boolean;
  messages: SlackMessage[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'Backlog' | 'In Progress' | 'Blocked' | 'Completed';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  assignee: string;
  assigneeAvatar: string;
  dueDate: string;
  tags: string[];
}

export interface DocItem {
  id: string;
  title: string;
  category: 'Charter' | 'Requirements' | 'Architecture' | 'Governance' | 'Risk';
  lastModified: string;
  author: string;
  status: 'Approved' | 'In Review' | 'Draft';
  content: string;
}

export interface SimulationEvent {
  id: string;
  title: string;
  category: 'Crisis' | 'Opportunity' | 'Scope Change' | 'Personnel';
  description: string;
  impactText: string;
  options: {
    label: string;
    description: string;
    trustDelta: number;
    xpDelta: number;
    consequence: string;
  }[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  category: 'Milestone' | 'Leadership' | 'Technical' | 'Streak';
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  company: string;
  role: string;
  trustScore: number;
  xp: number;
  streak: number;
  badge: string;
}

// MOCK DATA STORE
export const INITIAL_PLAYER_STATE = {
  name: "Alex Vance",
  role: "Lead Digital Transformer",
  company: "Apex Global Enterprise",
  industry: "FinTech & HRTech",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
  streakDays: 7,
  transformationXP: 1450,
  trustScore: 84,
  attendanceScore: 98,
  currentDay: 3,
  totalDays: 10,
  currentAct: "Act I: Foundation & Friction",
  rank: "Principal Transformer",
  consistencyMeter: 92,
};

export const STAKEHOLDERS: Stakeholder[] = [
  {
    id: "boss",
    name: "Marcus Boss",
    role: "Chief Technology Officer (CTO)",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
    trustLevel: 78,
    mood: "Demanding",
    status: "Online",
    pendingRequest: "Requires weekly steering committee update by EOD.",
    recentQuote: "Six weeks is non-negotiable. The board is watching this HR portal closely.",
    influence: "Critical",
    department: "Executive Committee",
    badgeCode: "B"
  },
  {
    id: "marshal",
    name: "Elena Marshal",
    role: "Chief Human Resources Officer (CHRO)",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250",
    trustLevel: 88,
    mood: "Enthusiastic",
    status: "Online",
    pendingRequest: "Wants end-user accessibility testing scheduled early.",
    recentQuote: "Our employees deserve a modern onboarding portal, not legacy forms.",
    influence: "High",
    department: "Human Resources",
    badgeCode: "M"
  },
  {
    id: "knox",
    name: "David Knox",
    role: "Head of Information Security (CISO)",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250",
    trustLevel: 62,
    mood: "Skeptical",
    status: "Busy",
    pendingRequest: "Waiting for SOC2 vendor security evaluation response.",
    recentQuote: "No data leaves our VPC without zero-trust authorization headers.",
    influence: "Critical",
    department: "Cyber Security",
    badgeCode: "K"
  },
  {
    id: "missy",
    name: "Missy Chen",
    role: "VP of Finance & Procurement",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250",
    trustLevel: 70,
    mood: "Critical",
    status: "In a Meeting",
    pendingRequest: "Needs ROI justification breakdown for cloud SaaS licenses.",
    recentQuote: "Scope creep will trigger a 15% budget penalty if unmonitored.",
    influence: "High",
    department: "Finance",
    badgeCode: "Ms"
  },
  {
    id: "lead_dev",
    name: "Tariq Dev",
    role: "Lead Software Architect",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=250",
    trustLevel: 92,
    mood: "Supportive",
    status: "Online",
    pendingRequest: "Needs final decision on SSO OAuth2 provider architecture.",
    recentQuote: "The microservices are ready; we just need clear API specs.",
    influence: "Medium",
    department: "Engineering",
    badgeCode: "T"
  }
];

export const EMAILS: Email[] = [
  {
    id: "email-1",
    sender: "David Knox (CISO)",
    senderRole: "Head of InfoSec",
    senderAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250",
    subject: "URGENT: Third-Party Authentication Audit for HR Portal",
    snippet: "We flagged potential zero-day vulnerabilities in the proposed auth SDK...",
    body: `Alex,\n\nOur automated security scanner picked up critical audit flags on the proposed third-party OAuth provider for the new HR Transformation portal.\n\nPlease ensure the architecture documentation is updated with multi-factor encryption layers prior to our steering check tomorrow.\n\nRegards,\nDavid Knox\nInfoSec Division`,
    timestamp: "09:42 AM",
    read: false,
    priority: "High",
    category: "Security",
    attachment: "InfoSec_Risk_Report_v2.pdf"
  },
  {
    id: "email-2",
    sender: "Elena Marshal (CHRO)",
    senderRole: "Chief HR Officer",
    senderAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250",
    subject: "RE: Onboarding Workflow & User Journey Feedback",
    snippet: "The executive team reviewed the initial wireframes and loved the simplicity...",
    body: `Hi Alex,\n\nGreat work on yesterday's kickoff presentation. The regional HR directors loved the interactive self-service portal roadmap.\n\nCould we add a quick video greeting component for new hires on day 1?\n\nBest,\nElena`,
    timestamp: "08:15 AM",
    read: false,
    priority: "Medium",
    category: "Updates"
  },
  {
    id: "email-3",
    sender: "Marcus Boss (CTO)",
    senderRole: "Chief Technology Officer",
    senderAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
    subject: "Steering Committee MOM & RAID Log Approval",
    snippet: "Make sure all action items from the kickoff are assigned in Jira/Linear...",
    body: `Alex,\n\nPlease compile the official Minutes of Meeting (MOM) for our executive board archive. We need full alignment across engineering, HR, and InfoSec before the week 2 sprint planning.\n\nKeep pushing,\nMarcus`,
    timestamp: "Yesterday",
    read: true,
    priority: "High",
    category: "Directives"
  }
];

export const SLACK_CHANNELS: SlackChannel[] = [
  {
    id: "c-hr-portal",
    name: "hr-portal-transformation",
    unreadCount: 3,
    messages: [
      {
        id: "m-1",
        senderId: "boss",
        senderName: "Marcus Boss (CTO)",
        senderAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
        content: "@channel Reminder: We are entering Day 3 of the 10-day milestone sprint. How are the API specifications looking for the payroll sync engine?",
        timestamp: "10:14 AM",
        reactions: [{ emoji: "🚀", count: 4, reacted: true }]
      },
      {
        id: "m-2",
        senderId: "lead_dev",
        senderName: "Tariq Dev",
        senderAvatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=250",
        content: "API specs are draft-ready! Just pending Knox's InfoSec approval on the token rotation mechanism.",
        timestamp: "10:16 AM"
      },
      {
        id: "m-3",
        senderId: "knox",
        senderName: "David Knox (CISO)",
        senderAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250",
        content: "Reviewing it now. If token expiry is under 15 mins, InfoSec will approve by lunch.",
        timestamp: "10:19 AM",
        reactions: [{ emoji: "🔒", count: 3 }]
      }
    ]
  },
  {
    id: "c-incidents",
    name: "incidents-war-room",
    unreadCount: 1,
    messages: [
      {
        id: "m-4",
        senderId: "lead_dev",
        senderName: "Tariq Dev",
        senderAvatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=250",
        content: "Staging server latency spiked to 450ms during stress test. Investigating database query indexing.",
        timestamp: "09:30 AM"
      }
    ]
  }
];

export const TASKS: Task[] = [
  {
    id: "TSK-101",
    title: "Finalize Executive Project Charter",
    description: "Align scope boundaries, budget constraints, and key milestones with CTO and CHRO.",
    status: "Completed",
    priority: "Critical",
    assignee: "Alex Vance",
    assigneeAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
    dueDate: "Day 1",
    tags: ["Governance", "Charter"]
  },
  {
    id: "TSK-102",
    title: "Publish Executive MOM & Action Tracker",
    description: "Synthesize kickoff meeting notes into structured Notion artifact for stakeholders.",
    status: "In Progress",
    priority: "High",
    assignee: "Alex Vance",
    assigneeAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
    dueDate: "Day 3 (Today)",
    tags: ["Documentation", "MOM"]
  },
  {
    id: "TSK-103",
    title: "Resolve InfoSec Zero-Trust OAuth Vulnerability",
    description: "Review Knox's security objections and approve enhanced JWT refresh mechanism.",
    status: "In Progress",
    priority: "Critical",
    assignee: "Tariq Dev",
    assigneeAvatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=250",
    dueDate: "Day 4",
    tags: ["Security", "Architecture"]
  },
  {
    id: "TSK-104",
    title: "Budget ROI Justification for Cloud Microservices",
    description: "Prepare financial impact spreadsheet for Missy Chen prior to mid-sprint check.",
    status: "Backlog",
    priority: "Medium",
    assignee: "Missy Chen",
    assigneeAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250",
    dueDate: "Day 5",
    tags: ["Finance", "ROI"]
  },
  {
    id: "TSK-105",
    title: "User Acceptance Testing (UAT) Scenario Scripts",
    description: "Write 12 realistic employee onboarding scenarios for HR team verification.",
    status: "Blocked",
    priority: "High",
    assignee: "Elena Marshal",
    assigneeAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250",
    dueDate: "Day 7",
    tags: ["UAT", "Testing"]
  }
];

export const DOCUMENTS: DocItem[] = [
  {
    id: "doc-charter",
    title: "Enterprise HR Portal Project Charter",
    category: "Charter",
    lastModified: "Today at 08:30 AM",
    author: "Alex Vance",
    status: "Approved",
    content: `# Enterprise HR Portal Transformation Charter

## Executive Summary
Apex Global Enterprise is initiating a complete modernization of its legacy Human Resources management ecosystem. The goal is to deploy an AI-augmented, unified employee onboarding and self-service portal within a strict 6-week window.

## Objectives & Key Results (OKRs)
- **OKR 1**: Reduce new employee onboarding lead-time from 14 days to under 48 hours.
- **OKR 2**: Achieve 100% Zero-Trust SOC2 compliance across all 14 global office locations.
- **OKR 3**: Automate 80% of routine HR service desk tickets via conversational AI agents.

## Governance & Steering Committee
- **Sponsor & CTO**: Marcus Boss
- **Business Owner**: Elena Marshal (CHRO)
- **Security Lead**: David Knox (CISO)
- **Finance Sponsor**: Missy Chen (VP Finance)
- **Digital Transformation Lead**: Alex Vance`
  },
  {
    id: "doc-raci",
    title: "Stakeholder RACI Matrix",
    category: "Governance",
    lastModified: "Yesterday",
    author: "Alex Vance",
    status: "Approved",
    content: `# HR Transformation RACI Matrix

| Workstream | CTO (Boss) | CHRO (Marshal) | CISO (Knox) | VP Finance (Missy) | Lead Transformer |
|---|---|---|---|---|---|
| Project Charter & Budget | Accountable | Consulted | Informed | Responsible | Responsible |
| Architecture & Security | Accountable | Informed | Responsible | Informed | Responsible |
| User Onboarding Workflow | Informed | Accountable | Consulted | Informed | Responsible |
| UAT & Signoff | Accountable | Accountable | Consulted | Informed | Responsible |`
  },
  {
    id: "doc-raid",
    title: "RAID Log & Risk Register",
    category: "Risk",
    lastModified: "2 hours ago",
    author: "Alex Vance",
    status: "In Review",
    content: `# RAID Log (Risks, Assumptions, Issues, Dependencies)

### Critical Risks
1. **RISK-01 (InfoSec Block)**: Delay in third-party OAuth approval from CISO Knox could slip Sprint 2 backend deployment by 3 days. Mitigation: Fast-track zero-trust architectural review.
2. **RISK-02 (Scope Expansion)**: CHRO requested live video streaming integration for welcome hub. Mitigation: Defer to Post-V1 release window.`
  }
];

export const SIMULATION_EVENTS: SimulationEvent[] = [
  {
    id: "event-resignation",
    title: "CRISIS: Lead Security Architect Tendered Resignation",
    category: "Personnel",
    description: "Tariq's senior backend engineer was poached by a rival fintech startup. The OAuth SSO token rotation delivery is now at immediate risk of delay.",
    impactText: "Impact: -15% Engineering Velocity | High Risk to Day 4 Security Gate",
    options: [
      {
        label: "Offer Immediate Retention Counter-Bonus",
        description: "Request an emergency 12% salary match from Missy (VP Finance).",
        trustDelta: +5,
        xpDelta: +150,
        consequence: "Missy is disgruntled by budget reallocation (-5 Finance trust), but dev team stays intact (+10 Engineering trust)."
      },
      {
        label: "Reassign Senior Frontend Dev & Pair Program",
        description: "Pivot internal capacity and simplify OAuth token complexity.",
        trustDelta: +10,
        xpDelta: +250,
        consequence: "CISO Knox approves the simplified architecture (+15 Security trust). Project remains strictly on schedule."
      },
      {
        label: "Outsource Security Audit to External Vendor",
        description: "Contract an expensive fast-track security consultancy.",
        trustDelta: -10,
        xpDelta: +50,
        consequence: "Outsourcing delays alignment by 2 days. CTO Boss questions lead transformer's internal execution capability."
      }
    ]
  },
  {
    id: "event-vulnerability",
    title: "SECURITY ALERT: Critical Zero-Day Patch Required",
    category: "Crisis",
    description: "CISO David Knox discovered a vulnerability in the underlying NodeJS dependency tree. He demands a 24-hour code freeze to audit all endpoints.",
    impactText: "Impact: Code Freeze requested | Sprint Timeline under friction",
    options: [
      {
        label: "Agree to Full 24-Hour Code Freeze",
        description: "Halt feature development to earn maximum security trust.",
        trustDelta: +15,
        xpDelta: +300,
        consequence: "Knox becomes your strongest ally (+20 CISO Trust). Dev team crunch time increased."
      },
      {
        label: "Propose Hotfix Patching in Parallel",
        description: "Continue feature work on isolated feature branches while patching.",
        trustDelta: +5,
        xpDelta: +200,
        consequence: "Balanced risk management. Delivery speed preserved with zero breach."
      }
    ]
  }
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "ach-1",
    title: "First Meeting Master",
    description: "Successfully accepted and led the CTO executive kickoff meeting.",
    icon: "Video",
    unlocked: true,
    unlockedAt: "Day 1",
    category: "Milestone"
  },
  {
    id: "ach-2",
    title: "Documentation Champion",
    description: "Generated perfect Executive MOM & aligned RACI governance across all C-suite members.",
    icon: "FileText",
    unlocked: true,
    unlockedAt: "Day 2",
    category: "Leadership"
  },
  {
    id: "ach-3",
    title: "Stakeholder Whisperer",
    description: "Maintained overall executive trust above 80% through 3 consecutive corporate crises.",
    icon: "Users",
    unlocked: true,
    unlockedAt: "Day 3",
    category: "Leadership"
  },
  {
    id: "ach-4",
    title: "Security & Zero-Trust Shield",
    description: "Passed CISO Knox's rigorous security audit without delaying production release.",
    icon: "ShieldCheck",
    unlocked: false,
    category: "Technical"
  },
  {
    id: "ach-5",
    title: "10-Day Streak Elite",
    description: "Completed every daily corporate simulation cycle without missing a single attendance check.",
    icon: "Flame",
    unlocked: false,
    category: "Streak"
  }
];

export const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: "Sophia Martinez", company: "Goldman Sachs", role: "VP Transformation", trustScore: 98, xp: 4850, streak: 14, badge: "Top 0.1%" },
  { rank: 2, name: "Alex Vance (You)", company: "Apex Global", role: "Lead Transformer", trustScore: 84, xp: 1450, streak: 7, badge: "Top 2%" },
  { rank: 3, name: "Vikram Patel", company: "McKinsey Digital", role: "Associate Partner", trustScore: 82, xp: 1410, streak: 6, badge: "Top 5%" },
  { rank: 4, name: "Chloe Dupont", company: "L'Oréal Tech", role: "Head of Product", trustScore: 79, xp: 1290, streak: 5, badge: "Top 10%" },
  { rank: 5, name: "Marcus Thorne", company: "Barclays", role: "Digital Program Dir", trustScore: 75, xp: 1150, streak: 4, badge: "Top 15%" }
];
