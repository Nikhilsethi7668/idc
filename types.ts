
export enum EventStatus {
  GREEN = 'GREEN',   // On track
  AMBER = 'AMBER',   // At risk
  RED = 'RED'        // Critical / 10-day rule violation
}

export enum Region {
  NA = 'North America',
  EMEA = 'EMEA',
  APAC = 'Asia Pacific',
  LATAM = 'Latin America'
}

export interface DailyReg {
  date: string;
  count: number;
}

export interface EventData {
  id: string;
  name: string;
  region: Region;
  category: string; // e.g., "CIO Summit", "Webinar"
  date: string;
  targetRegistrations: number;
  currentRegistrations: number;
  revenue: number;
  status: EventStatus;
  owner: string;
  dailyRegistrations: DailyReg[];
  integrations: string[]; // e.g., "Cvent", "Salesforce"
  coordinates: [number, number]; // [lat, lng]
}

export interface KPIMetrics {
  totalEvents: number;
  redAlertCount: number;
  totalRevenue: number;
  globalRegistrations: number;
}

// --- Module 2: Red Alert Engine Types ---

export enum AlertSeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM'
}

export enum AlertStatus {
  NEW = 'NEW',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  ESCALATED = 'ESCALATED',
  RESOLVED = 'RESOLVED'
}

export interface AlertRule {
  category: string;
  thresholdPercentage: number; // e.g., 0.60 for 60%
}

export interface Alert {
  id: string;
  eventId: string;
  eventName: string;
  severity: AlertSeverity;
  status: AlertStatus;
  triggeredAt: string;
  condition: string; // e.g., "10 Days Out AND < 60% Target"
  metrics: {
    daysRemaining: number;
    currentReg: number;
    targetReg: number;
    gap: number;
  };
  assignee: string;
}

// --- Module 5: Regional Intelligence Types ---

export interface RegionMetric {
  region: Region;
  velocity: number; // Registrations per day avg
  conversion: number; // Lead to Reg %
  yield: number; // Revenue per attendee
  sentiment: number; // AI Market Sentiment Score (0-100)
}

// --- Module 6: Competitor Intelligence Types ---

export interface CompetitorEvent {
  id: string;
  name: string;
  organizer: string; // e.g., "Gartner", "Forrester"
  date: string;
  region: Region;
  overlapScore: number; // 0-100 (Audience overlap)
  clashLevel: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface ConflictAnalysis {
  riskScore: number;
  cannibalizationEstimate: number; // Estimated lost attendees
  recommendation: string;
}

// --- Module 7: Fraud Defense Types ---

export enum FraudStatus {
  DETECTED = 'DETECTED',
  INVESTIGATING = 'INVESTIGATING',
  BLOCKED = 'BLOCKED',
  CLEARED = 'CLEARED'
}

export enum RiskLevel {
  CRITICAL = 'CRITICAL', // Score 90-100
  HIGH = 'HIGH',         // Score 70-89
  MODERATE = 'MODERATE', // Score 40-69
  LOW = 'LOW'            // Score 0-39
}

export interface FraudCase {
  id: string;
  eventId: string;
  eventName: string;
  registrationName: string;
  email: string;
  ipAddress: string;
  location: string;
  timestamp: string;
  riskScore: number; // 0-100
  riskLevel: RiskLevel;
  status: FraudStatus;
  flags: string[]; // e.g., ["Velocity Limit Exceeded", "Tor Node IP"]
  deviceFingerprint: string;
}

// --- Module 8: AI Content Engine Types ---

export enum ContentChannel {
  EMAIL = 'EMAIL',
  LINKEDIN_AD = 'LINKEDIN_AD',
  GOOGLE_AD = 'GOOGLE_AD',
  LANDING_PAGE = 'LANDING_PAGE',
  META_AD = 'META_AD', // Added for Module 11
  TIKTOK_AD = 'TIKTOK_AD' // Added for Module 11
}

export interface MarketingParams {
  eventId: string;
  channel: ContentChannel;
  audience: string; // e.g. "C-Level Execs", "Technical Practitioners"
  tone: string; // e.g. "Urgent", "Visionary", "Exclusive"
}

// --- Module 9: AI Predictive Analytics Types ---

export interface PredictionPoint {
  date: string;
  actual: number | null;
  predicted: number;
  lowerBound: number;
  upperBound: number;
}

export interface SimulationParams {
  budgetIncrease: number; // USD thousands
  ticketDiscount: number; // Percentage
  addSpeaker: boolean;
}

export interface NLPQueryResult {
  query: string;
  answer: string; // Markdown answer from Oracle
  timestamp: string;
}

// --- Module 10: Revenue & ROI Intelligence Types ---

export interface RevenueStream {
  source: string; // e.g., "Tickets", "Sponsorship", "Exhibitor Fees"
  amount: number;
}

export interface CostCenter {
  category: string; // e.g., "Venue", "Marketing", "Speakers"
  amount: number;
}

export interface FinancialProfile {
  eventId: string;
  eventName: string;
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  marginPercent: number;
  roiPercent: number;
  revenueStreams: RevenueStream[];
  costCenters: CostCenter[];
  forecastedRevenue: number;
  healthScore: 'EXCELLENT' | 'NEUTRAL' | 'POOR';
}

// --- Module 11: Deep Marketing Engine Types ---

export interface ChannelMetric {
  channel: ContentChannel;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  cpa: number; // Cost Per Acquisition
  roas: number; // Return on Ad Spend
  fatigueScore: number; // 0-100 (Ad Fatigue)
}

export interface MarketingCampaign {
  id: string;
  eventId: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'OPTIMIZING' | 'COMPLETED';
  budget: number;
  spent: number;
  healthScore: number; // 0-100
  channels: ChannelMetric[];
  startDate: string;
  endDate: string;
}

export interface MarketingPersona {
  id: string;
  name: string;
  role: string;
  painPoints: string[];
  preferredChannels: ContentChannel[];
  engagementScore: number; // 0-100
}

// --- Module 14: Sponsorship & Monetization Types ---

export interface SponsorshipTier {
  name: 'Platinum' | 'Gold' | 'Silver' | 'Bronze';
  price: number;
  slotsAvailable: number;
  slotsSold: number;
  benefits: string[];
}

export interface SponsorshipPackage {
  eventId: string;
  eventName: string;
  tiers: SponsorshipTier[];
  projectedRevenue: number;
}

export interface Sponsor {
  id: string;
  companyName: string;
  industry: string;
  fitScore: number; // 0-100 AI score
  status: 'PROSPECT' | 'CONTACTED' | 'NEGOTIATING' | 'SIGNED';
  assignedTier?: string;
  projectedValue: number;
  contactEmail: string;
}

// --- Module 15: Speaker Intelligence Types ---

export interface Speaker {
  id: string;
  name: string;
  role: string; // e.g. "IDC VP", "Industry CEO"
  company: string;
  bio: string;
  historicalRating: number; // 0-5 stars
  engagementScore: number; // 0-100
  specialties: string[];
  image?: string;
}

export interface Session {
  id: string;
  speakerId: string;
  eventId: string;
  title: string;
  abstract: string;
  track: string;
  startTime: string; // ISO
  predictedAttendance: number; // AI forecast
  contentScore: number; // 0-100
}

export interface SpeakerAnalysis {
  authorityScore: number;
  charismaScore: number;
  retentionPrediction: number; // %
  strengths: string[];
  weaknesses: string[];
  recommendedTracks: string[];
}

// --- Module 16: Live Operations Types ---

export interface LiveSession {
  id: string;
  name: string;
  roomName: string;
  capacity: number;
  currentAttendance: number;
  status: 'ON_TIME' | 'DELAYED' | 'TECH_ISSUE' | 'FULL';
  startTime: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: 'Tech' | 'Usher' | 'Security' | 'Medic';
  status: 'IDLE' | 'BUSY' | 'OFFLINE';
  location: string;
}

export interface OpsAlert {
  id: string;
  type: 'CROWD' | 'TECH' | 'SAFETY' | 'STAFF';
  message: string;
  severity: AlertSeverity;
  timestamp: string;
  resolved: boolean;
}
