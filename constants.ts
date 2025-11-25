
import { EventData, EventStatus, Region, RegionMetric, CompetitorEvent, FraudCase, RiskLevel, FraudStatus, PredictionPoint, FinancialProfile, MarketingCampaign, ContentChannel, MarketingPersona, Sponsor, SponsorshipPackage, Speaker, Session, LiveSession, StaffMember, OpsAlert, AlertSeverity } from './types';

// Helper to generate past 30 days of mock registration data
const generateTrend = (base: number, volatility: number) => {
  const data = [];
  const today = new Date();
  for (let i = 30; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    data.push({
      date: d.toISOString().split('T')[0],
      count: Math.floor(base * (1 - i / 40) + Math.random() * volatility)
    });
  }
  return data;
};

export const MOCK_EVENTS: EventData[] = [
  {
    id: 'evt-001',
    name: 'IDC CIO Summit Singapore',
    region: Region.APAC,
    category: 'Summit',
    date: new Date(Date.now() + 86400000 * 9).toISOString(), // 9 days from now (CRITICAL)
    targetRegistrations: 600,
    currentRegistrations: 220, // < 60% threshold -> RED ALERT
    revenue: 450000,
    status: EventStatus.RED,
    owner: 'Sarah Lin',
    dailyRegistrations: generateTrend(200, 20),
    integrations: ['Cvent', 'Salesforce'],
    coordinates: [1.3521, 103.8198]
  },
  {
    id: 'evt-002',
    name: 'European Cloud Conference',
    region: Region.EMEA,
    category: 'Conference',
    date: new Date(Date.now() + 86400000 * 45).toISOString(),
    targetRegistrations: 1200,
    currentRegistrations: 950,
    revenue: 1200000,
    status: EventStatus.GREEN,
    owner: 'Marcus Weber',
    dailyRegistrations: generateTrend(900, 50),
    integrations: ['Bizzabo', 'Marketo'],
    coordinates: [52.5200, 13.4050] // Berlin
  },
  {
    id: 'evt-003',
    name: 'North America Security Forum',
    region: Region.NA,
    category: 'Forum',
    date: new Date(Date.now() + 86400000 * 12).toISOString(),
    targetRegistrations: 400,
    currentRegistrations: 210, // Close to date, low regs -> AMBER
    revenue: 300000,
    status: EventStatus.AMBER,
    owner: 'Jessica Pearson',
    dailyRegistrations: generateTrend(200, 10),
    integrations: ['Zoom Events', 'HubSpot'],
    coordinates: [40.7128, -74.0060] // New York
  },
  {
    id: 'evt-004',
    name: 'Future of Work Latin America',
    region: Region.LATAM,
    category: 'Webinar',
    date: new Date(Date.now() + 86400000 * 5).toISOString(),
    targetRegistrations: 1500,
    currentRegistrations: 1450,
    revenue: 80000,
    status: EventStatus.GREEN,
    owner: 'Carlos Mendez',
    dailyRegistrations: generateTrend(1400, 100),
    integrations: ['On24', 'Eloqua'],
    coordinates: [-23.5505, -46.6333] // Sao Paulo
  }
];

export const MOCK_REGIONAL_METRICS: RegionMetric[] = [
  { region: Region.NA, velocity: 45, conversion: 22, yield: 1200, sentiment: 85 },
  { region: Region.EMEA, velocity: 38, conversion: 18, yield: 950, sentiment: 72 },
  { region: Region.APAC, velocity: 52, conversion: 28, yield: 600, sentiment: 91 },
  { region: Region.LATAM, velocity: 25, conversion: 15, yield: 400, sentiment: 65 }
];

export const MOCK_COMPETITOR_EVENTS: CompetitorEvent[] = [
  {
    id: 'comp-001',
    name: 'Gartner IT Symposium/Xpo',
    organizer: 'Gartner',
    date: new Date(Date.now() + 86400000 * 7).toISOString(), // 2 days BEFORE IDC CIO Summit (Major Clash)
    region: Region.APAC,
    overlapScore: 85,
    clashLevel: 'HIGH'
  },
  {
    id: 'comp-002',
    name: 'Forrester Technology & Innovation',
    organizer: 'Forrester',
    date: new Date(Date.now() + 86400000 * 14).toISOString(), // Close to NA Security Forum
    region: Region.NA,
    overlapScore: 45,
    clashLevel: 'MEDIUM'
  },
  {
    id: 'comp-003',
    name: 'AWS Summit Berlin',
    organizer: 'AWS',
    date: new Date(Date.now() + 86400000 * 40).toISOString(), // 5 days before Euro Cloud Conf
    region: Region.EMEA,
    overlapScore: 60,
    clashLevel: 'MEDIUM'
  }
];

export const MOCK_FRAUD_CASES: FraudCase[] = [
  {
    id: 'fr-001',
    eventId: 'evt-001',
    eventName: 'IDC CIO Summit Singapore',
    registrationName: 'John Smith',
    email: 'john.smith8822@temp-mail.org',
    ipAddress: '203.0.113.45',
    location: 'Unknown / VPN',
    timestamp: new Date().toISOString(),
    riskScore: 92,
    riskLevel: RiskLevel.CRITICAL,
    status: FraudStatus.DETECTED,
    flags: ['Disposable Email Domain', 'Velocity: 5 signups in 1 min', 'Headless Browser UserAgent'],
    deviceFingerprint: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome'
  },
  {
    id: 'fr-002',
    eventId: 'evt-004',
    eventName: 'Future of Work Latin America',
    registrationName: 'AABB Test',
    email: 'test_admin@gmail.com',
    ipAddress: '198.51.100.23',
    location: 'Sao Paulo, BR',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    riskScore: 75,
    riskLevel: RiskLevel.HIGH,
    status: FraudStatus.INVESTIGATING,
    flags: ['Keyboard Mashing Detected', 'Non-Business Email'],
    deviceFingerprint: 'Windows 10 / Chrome 120'
  },
  {
    id: 'fr-003',
    eventId: 'evt-002',
    eventName: 'European Cloud Conference',
    registrationName: 'Bot Net Worker 1',
    email: 'worker01@163.com',
    ipAddress: '192.168.1.1 (Tor Exit Node)',
    location: 'Romania',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    riskScore: 98,
    riskLevel: RiskLevel.CRITICAL,
    status: FraudStatus.BLOCKED,
    flags: ['Tor Exit Node IP', 'Known Botnet Pattern', 'Bulk Registration (1 of 50)'],
    deviceFingerprint: 'Python Requests/2.31'
  }
];

export const MOCK_AUDIENCES = [
  "C-Level Executives (CIO, CTO, CISO)",
  "IT Directors & VPs",
  "Cloud Architects & Developers",
  "Security Practitioners",
  "Business Line Managers"
];

export const RED_ALERT_THRESHOLD_DAYS = 10;
export const RED_ALERT_REG_PERCENTAGE = 0.60;

// Module 9: Mock Predictive Data
export const MOCK_PREDICTION_DATA: PredictionPoint[] = [];
const today = new Date();
// Generate 30 days history (Actual) + 30 days forecast (Predicted)
for (let i = -30; i <= 30; i++) {
  const d = new Date(today);
  d.setDate(d.getDate() + i);
  const dateStr = d.toISOString().split('T')[0];
  
  // Base curve
  const t = i + 30; // 0 to 60
  const baseValue = 200 + (t * 5) + (Math.sin(t / 5) * 50);
  
  if (i <= 0) {
    // History
    MOCK_PREDICTION_DATA.push({
      date: dateStr,
      actual: Math.floor(baseValue + (Math.random() * 20 - 10)),
      predicted: Math.floor(baseValue),
      lowerBound: Math.floor(baseValue - 20),
      upperBound: Math.floor(baseValue + 20)
    });
  } else {
    // Forecast
    MOCK_PREDICTION_DATA.push({
      date: dateStr,
      actual: null,
      predicted: Math.floor(baseValue),
      lowerBound: Math.floor(baseValue - (i * 2)), // Uncertainty grows
      upperBound: Math.floor(baseValue + (i * 2))
    });
  }
}

// Module 10: Mock Financial Data
export const MOCK_FINANCIALS: FinancialProfile[] = [
  {
    eventId: 'evt-001', // IDC CIO Summit Singapore
    eventName: 'IDC CIO Summit Singapore',
    totalRevenue: 450000,
    totalCost: 380000,
    grossProfit: 70000,
    marginPercent: 15.5,
    roiPercent: 18.4,
    revenueStreams: [
      { source: 'Tickets', amount: 150000 },
      { source: 'Sponsorship', amount: 300000 }
    ],
    costCenters: [
      { category: 'Venue', amount: 120000 },
      { category: 'Marketing', amount: 150000 },
      { category: 'Operations', amount: 110000 }
    ],
    forecastedRevenue: 480000,
    healthScore: 'POOR' // High cost, low margin
  },
  {
    eventId: 'evt-002', // European Cloud Conference
    eventName: 'European Cloud Conference',
    totalRevenue: 1200000,
    totalCost: 650000,
    grossProfit: 550000,
    marginPercent: 45.8,
    roiPercent: 84.6,
    revenueStreams: [
      { source: 'Tickets', amount: 800000 },
      { source: 'Sponsorship', amount: 400000 }
    ],
    costCenters: [
      { category: 'Venue', amount: 300000 },
      { category: 'Marketing', amount: 200000 },
      { category: 'Speakers', amount: 150000 }
    ],
    forecastedRevenue: 1250000,
    healthScore: 'EXCELLENT'
  },
  {
    eventId: 'evt-003', // NA Security Forum
    eventName: 'North America Security Forum',
    totalRevenue: 300000,
    totalCost: 200000,
    grossProfit: 100000,
    marginPercent: 33.3,
    roiPercent: 50.0,
    revenueStreams: [
      { source: 'Tickets', amount: 100000 },
      { source: 'Sponsorship', amount: 200000 }
    ],
    costCenters: [
      { category: 'Venue', amount: 80000 },
      { category: 'Marketing', amount: 80000 },
      { category: 'Operations', amount: 40000 }
    ],
    forecastedRevenue: 310000,
    healthScore: 'NEUTRAL'
  },
  {
    eventId: 'evt-004', // Future of Work LATAM
    eventName: 'Future of Work Latin America',
    totalRevenue: 80000,
    totalCost: 25000,
    grossProfit: 55000,
    marginPercent: 68.7,
    roiPercent: 220.0,
    revenueStreams: [
      { source: 'Tickets', amount: 20000 }, // Webinar (low ticket $)
      { source: 'Sponsorship', amount: 60000 }
    ],
    costCenters: [
      { category: 'Platform', amount: 10000 },
      { category: 'Marketing', amount: 15000 }
    ],
    forecastedRevenue: 85000,
    healthScore: 'EXCELLENT'
  }
];

// Module 11: Mock Deep Marketing Data
export const MOCK_MARKETING_CAMPAIGNS: MarketingCampaign[] = [
  {
    id: 'camp-001',
    eventId: 'evt-001',
    name: 'Singapore Summit - Early Bird Push',
    status: 'OPTIMIZING',
    budget: 50000,
    spent: 35000,
    healthScore: 68,
    startDate: '2023-09-01',
    endDate: '2023-11-01',
    channels: [
      { channel: ContentChannel.LINKEDIN_AD, spend: 20000, impressions: 45000, clicks: 850, conversions: 45, cpa: 444, roas: 3.2, fatigueScore: 45 },
      { channel: ContentChannel.GOOGLE_AD, spend: 15000, impressions: 12000, clicks: 1200, conversions: 30, cpa: 500, roas: 2.1, fatigueScore: 20 }
    ]
  },
  {
    id: 'camp-002',
    eventId: 'evt-002',
    name: 'Euro Cloud - C-Level Awareness',
    status: 'ACTIVE',
    budget: 120000,
    spent: 80000,
    healthScore: 92,
    startDate: '2023-08-15',
    endDate: '2023-12-01',
    channels: [
      { channel: ContentChannel.LINKEDIN_AD, spend: 60000, impressions: 180000, clicks: 2400, conversions: 120, cpa: 500, roas: 4.5, fatigueScore: 15 },
      { channel: ContentChannel.EMAIL, spend: 10000, impressions: 50000, clicks: 5000, conversions: 200, cpa: 50, roas: 15.0, fatigueScore: 80 }, // High fatigue on email
      { channel: ContentChannel.META_AD, spend: 10000, impressions: 300000, clicks: 1500, conversions: 10, cpa: 1000, roas: 0.8, fatigueScore: 10 }
    ]
  }
];

export const MOCK_PERSONAS: MarketingPersona[] = [
  {
    id: 'p-001',
    name: 'The Visionary CIO',
    role: 'Chief Information Officer',
    painPoints: ['Legacy modernization', 'AI ROI justification', 'Talent retention'],
    preferredChannels: [ContentChannel.LINKEDIN_AD, ContentChannel.EMAIL],
    engagementScore: 88
  },
  {
    id: 'p-002',
    name: 'The Security Architect',
    role: 'CISO / Lead Architect',
    painPoints: ['Zero trust implementation', 'Cloud compliance', 'Threat detection'],
    preferredChannels: [ContentChannel.GOOGLE_AD, ContentChannel.LANDING_PAGE],
    engagementScore: 65
  }
];

// Module 14: Mock Sponsors
export const MOCK_SPONSORS: Sponsor[] = [
  {
    id: 'sp-001',
    companyName: 'TechFlow Systems',
    industry: 'Cloud Infrastructure',
    fitScore: 94,
    status: 'NEGOTIATING',
    projectedValue: 75000,
    contactEmail: 'partners@techflow.io'
  },
  {
    id: 'sp-002',
    companyName: 'CyberGuard One',
    industry: 'Cybersecurity',
    fitScore: 88,
    status: 'PROSPECT',
    projectedValue: 45000,
    contactEmail: 'sponsorship@cyberguard.com'
  },
  {
    id: 'sp-003',
    companyName: 'DataSphere Analytics',
    industry: 'Big Data / AI',
    fitScore: 72,
    status: 'CONTACTED',
    projectedValue: 25000,
    contactEmail: 'marketing@datasphere.net'
  }
];

export const MOCK_PACKAGES: SponsorshipPackage[] = [
  {
    eventId: 'evt-001',
    eventName: 'IDC CIO Summit Singapore',
    projectedRevenue: 300000,
    tiers: [
      {
        name: 'Platinum',
        price: 50000,
        slotsAvailable: 3,
        slotsSold: 2,
        benefits: ['Keynote Slot', 'VIP Dinner Host', 'Premium Booth']
      },
      {
        name: 'Gold',
        price: 25000,
        slotsAvailable: 5,
        slotsSold: 4,
        benefits: ['Breakout Session', 'Logo on Lanyards', 'Standard Booth']
      },
      {
        name: 'Silver',
        price: 10000,
        slotsAvailable: 10,
        slotsSold: 6,
        benefits: ['Logo on Website', 'Bag Insert']
      }
    ]
  }
];

// Module 15: Mock Speakers & Sessions
export const MOCK_SPEAKERS: Speaker[] = [
  {
    id: 'spk-001',
    name: 'Dr. Elena Rostova',
    role: 'VP, AI Research',
    company: 'IDC',
    bio: 'Leading expert in Generative AI implementation strategies for enterprise.',
    historicalRating: 4.8,
    engagementScore: 95,
    specialties: ['Artificial Intelligence', 'Digital Transformation'],
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena'
  },
  {
    id: 'spk-002',
    name: 'James Chen',
    role: 'Group CEO',
    company: 'FutureTech Holdings',
    bio: 'Visionary leader overseeing digital infrastructure across APAC.',
    historicalRating: 4.2,
    engagementScore: 78,
    specialties: ['Leadership', 'Cloud Infrastructure'],
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James'
  },
  {
    id: 'spk-003',
    name: 'Sarah O\'Connor',
    role: 'Chief Security Officer',
    company: 'Global Bank Corp',
    bio: 'Expert in Zero Trust architecture and financial compliance.',
    historicalRating: 3.9,
    engagementScore: 65,
    specialties: ['Cybersecurity', 'FinTech'],
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
  }
];

export const MOCK_SESSIONS: Session[] = [
  {
    id: 'sess-001',
    speakerId: 'spk-001',
    eventId: 'evt-001',
    title: 'Generative AI: Moving Beyond the Hype',
    abstract: 'This session explores practical use cases for GenAI in 2024, focusing on ROI and implementation hurdles.',
    track: 'Main Stage',
    startTime: '2023-11-15T09:00:00Z',
    predictedAttendance: 450,
    contentScore: 85
  },
  {
    id: 'sess-002',
    speakerId: 'spk-002',
    eventId: 'evt-001',
    title: 'Cloud Infrastructure for the Next Decade',
    abstract: 'A look at how cloud computing is evolving to support edge and AI workloads.',
    track: 'Cloud Track',
    startTime: '2023-11-15T11:00:00Z',
    predictedAttendance: 200,
    contentScore: 72
  },
  {
    id: 'sess-003',
    speakerId: 'spk-003',
    eventId: 'evt-003',
    title: 'Zero Trust in Banking',
    abstract: 'Implementing ZTNA in highly regulated environments.',
    track: 'Security Track',
    startTime: '2023-12-05T14:00:00Z',
    predictedAttendance: 150,
    contentScore: 68
  }
];

// Module 16: Live Operations Data
export const MOCK_LIVE_SESSIONS: LiveSession[] = [
  { id: 'ls-001', name: 'Opening Keynote', roomName: 'Grand Ballroom', capacity: 1000, currentAttendance: 980, status: 'FULL', startTime: '09:00 AM' },
  { id: 'ls-002', name: 'Cloud Security Workshop', roomName: 'Room 302', capacity: 200, currentAttendance: 215, status: 'ON_TIME', startTime: '10:30 AM' }, // Overcrowded
  { id: 'ls-003', name: 'Networking Lunch', roomName: 'Foyer', capacity: 500, currentAttendance: 350, status: 'ON_TIME', startTime: '12:00 PM' },
  { id: 'ls-004', name: 'Digital Twin Panel', roomName: 'Room 205', capacity: 150, currentAttendance: 40, status: 'TECH_ISSUE', startTime: '01:00 PM' },
];

export const MOCK_STAFF: StaffMember[] = [
  { id: 'st-001', name: 'Mike Ross', role: 'Tech', status: 'BUSY', location: 'Room 205' },
  { id: 'st-002', name: 'Rachel Zane', role: 'Usher', status: 'IDLE', location: 'Lobby' },
  { id: 'st-003', name: 'Harvey Specter', role: 'Security', status: 'BUSY', location: 'VIP Entrance' },
  { id: 'st-004', name: 'Donna Paulsen', role: 'Tech', status: 'IDLE', location: 'Control Room' },
];

export const MOCK_OPS_ALERTS: OpsAlert[] = [
  { id: 'oa-001', type: 'CROWD', message: 'Capacity Warning: Room 302 is at 107%', severity: AlertSeverity.HIGH, timestamp: '10:45 AM', resolved: false },
  { id: 'oa-002', type: 'TECH', message: 'Projector Failure: Room 205', severity: AlertSeverity.MEDIUM, timestamp: '01:05 PM', resolved: false },
];
