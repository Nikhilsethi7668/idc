
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { EventData, Alert, RegionMetric, CompetitorEvent, FraudCase, MarketingParams, ContentChannel, SimulationParams, FinancialProfile, MarketingCampaign, MarketingPersona, Sponsor, SponsorshipPackage, Speaker, Session, OpsAlert } from "../types";

// Helper to get a fresh AI client instance
const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

// Helper to clean JSON output from LLM (removes markdown fences)
const cleanJson = (text: string): string => {
  if (!text) return "{}";
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned;
};

// ⚡ FAST AI: Use gemini-2.5-flash-lite for quick executive summaries
export const generateEventAnalysis = async (event: EventData): Promise<string> => {
  try {
    const ai = getAIClient();
    const daysRemaining = Math.ceil((new Date(event.date).getTime() - Date.now()) / (1000 * 3600 * 24));
    const percentage = Math.round((event.currentRegistrations / event.targetRegistrations) * 100);

    const prompt = `
      You are an expert Event Intelligence Consultant for IDC (International Data Corporation).
      Analyze the following event status and provide an executive summary and 3 specific remediation actions.
      
      Event: ${event.name}
      Region: ${event.region}
      Category: ${event.category}
      Days Remaining: ${daysRemaining}
      Current Registrations: ${event.currentRegistrations}
      Target: ${event.targetRegistrations}
      Progress: ${percentage}%
      Status: ${event.status}
      
      The "10-Day Red Alert Rule" is active: If days < 10 and registrations < 60%, immediate action is required.
      
      Format the response in Markdown:
      ## Executive Summary
      [Brief analysis of risk level]
      
      ## Recommended Playbook Actions
      1. [Action 1]
      2. [Action 2]
      3. [Action 3]
      
      ## Forecast
      [Short prediction based on typical late-stage curves]
    `;

    // FAST AI RESPONSE
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 500,
      }
    });

    return response.text || "Analysis currently unavailable.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "## Analysis System Offline\nUnable to connect to the AI forecasting engine. Please check your network or API key configuration.";
  }
};

export const generateAlertCommunications = async (alert: Alert): Promise<any> => {
  try {
    const ai = getAIClient();
    const prompt = `
      Generate a multi-channel Red Alert notification pack for an underperforming IDC event.
      
      Context:
      Event: ${alert.eventName}
      Status: CRITICAL (10-Day Rule Violation)
      Current Registrations: ${alert.metrics.currentReg}
      Target: ${alert.metrics.targetReg}
      Gap: ${alert.metrics.gap}
      Days Remaining: ${alert.metrics.daysRemaining}
      
      Output three distinct messages in a valid JSON object.
      
      Schema:
      {
        "email": {
          "subject": "Subject Line",
          "body": "Formal HTML body content"
        },
        "slack": "Urgent slack message content",
        "sms": "Brief SMS message"
      }
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.8,
        responseMimeType: "application/json"
      }
    });

    const cleanedText = cleanJson(response.text || "{}");
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};

export const generateRemediationPlan = async (alert: Alert): Promise<string> => {
  try {
    const ai = getAIClient();
    const prompt = `
      Create a "Red Alert Remediation Playbook" for this distressed IDC event.
      
      Event: ${alert.eventName}
      Gap: ${alert.metrics.gap} registrations needed in ${alert.metrics.daysRemaining} days.
      Condition: ${alert.condition}
      
      Provide a structured response:
      1. Root Cause Analysis (Why are we here?)
      2. Immediate Recovery Actions (Next 24 Hours)
      3. Budget Allocation Recommendation (Ad Spend boost calculation)
      4. Probability of Success (Low/Medium/High)
      
      Format in clean Markdown with headers.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 800,
      }
    });

    return response.text || "Unable to generate remediation plan.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating remediation plan.";
  }
};

export const generateMarketAnalysis = async (metrics: RegionMetric[]): Promise<string> => {
  try {
    const ai = getAIClient();
    const dataString = metrics.map(m => 
      `${m.region}: Velocity=${m.velocity}/day, Conv=${m.conversion}%, Yield=$${m.yield}, Sentiment=${m.sentiment}`
    ).join('\n');

    const prompt = `
      You are IDC's Global Market Intelligence Director. Analyze the following regional benchmark data:
      
      ${dataString}
      
      Provide a strategic market analysis:
      1. Identify the Top Performing Region and why.
      2. Identify the Underperforming Region and suggest 2 strategic shifts.
      3. Predict next quarter's growth hotspot.
      
      Format as concise Markdown.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 600,
      }
    });
    
    return response.text || "Market analysis unavailable.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "## Analysis Unavailable\nSystem could not reach the Global Intelligence Engine.";
  }
};

export const generateConflictStrategy = async (idcEvent: EventData, competitor: CompetitorEvent): Promise<string> => {
  try {
    const ai = getAIClient();
    const prompt = `
      You are a Competitive Strategy AI for IDC. 
      Conflict Detected:
      IDC Event: ${idcEvent.name} (${new Date(idcEvent.date).toLocaleDateString()}) in ${idcEvent.region}
      Competitor: ${competitor.name} by ${competitor.organizer} (${new Date(competitor.date).toLocaleDateString()})
      Overlap Score: ${competitor.overlapScore}/100
      
      Provide a "Defensive Strategy Report":
      1. Cannibalization Risk Assessment (Estimated % audience loss).
      2. Topic Differentiation Strategy (How to pivot messaging).
      3. Pricing/Incentive Recommendation (e.g., Early bird extension).
      4. Verdict: Hold Date vs. Move Date.
      
      Format as Markdown.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.6,
        maxOutputTokens: 500,
      }
    });
    
    return response.text || "Strategy generation failed.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "## Strategy Engine Offline\nUnable to calculate competitive risk.";
  }
};

export const generateFraudAnalysis = async (fraudCase: FraudCase): Promise<string> => {
  try {
    const ai = getAIClient();
    const prompt = `
      You are an expert Cybersecurity Analyst for IDC.
      Analyze this flagged registration for fraud potential.
      
      Data:
      Email: ${fraudCase.email}
      IP Address: ${fraudCase.ipAddress} (${fraudCase.location})
      Risk Score: ${fraudCase.riskScore}/100
      Flags Triggered: ${fraudCase.flags.join(', ')}
      Device: ${fraudCase.deviceFingerprint}
      
      Provide a "Forensic Security Report":
      1. Threat Vector Analysis (What type of attack is this? e.g., Botnet, Scraper, credential stuffing).
      2. Identity Verification Assessment (Does the email/location look legitimate?).
      3. Recommended Action (Block / Challenge / Allow).
      4. Prevention Strategy (How to block similar attacks in future).
      
      Format as Markdown.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.4, // Lower temperature for analytical precision
        maxOutputTokens: 600,
      }
    });
    
    return response.text || "Fraud analysis failed.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "## Security Engine Offline\nUnable to run forensic analysis.";
  }
};

export const generateMarketingContent = async (params: MarketingParams, eventName: string): Promise<string> => {
  try {
    const ai = getAIClient();
    const prompt = `
      You are IDC's Lead Copywriter and Marketing AI. 
      Create high-performance marketing content for the following campaign:
      
      Event: ${eventName}
      Channel: ${params.channel}
      Target Audience: ${params.audience}
      Tone: ${params.tone}
      
      Instructions:
      - If Channel is EMAIL, provide a Subject Line and HTML Body code snippet with inline CSS for a professional look.
      - If Channel is LINKEDIN_AD or GOOGLE_AD, provide 3 variations of Headlines and Primary Text.
      - If Channel is LANDING_PAGE, provide a Hero Section headline, Value Proposition bullets, and a Call to Action.
      
      Include a section called "Projected Conversion Rate" with a percentage based on historical data for this audience.
      
      Format entirely in Markdown. Use code blocks for HTML.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.8,
        maxOutputTokens: 1000,
      }
    });

    return response.text || "Content generation failed.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "## AI Marketing Engine Offline\nUnable to generate content assets.";
  }
};

// 📍 MAPS GROUNDING: Find venues near event
export const getVenueRecommendations = async (lat: number, lng: number, query: string): Promise<string> => {
  try {
    const ai = getAIClient();
    
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Find 3 places near this location matching: "${query}". For each, provide the name, a 1-sentence description, and why it's good for business travelers.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: { latitude: lat, longitude: lng }
          }
        }
      }
    });

    // Extract grounding URLs if available
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    let text = response.text || "No venue data found.";
    
    // Append map links manually if desired, though standard text usually integrates them well in markdown
    if (groundingChunks) {
      // Logic to append map links if needed, or rely on Markdown text from model
    }

    return text;
  } catch (error) {
    console.error("Gemini Maps Error:", error);
    return "## Venue Intelligence Offline\nMaps Grounding unavailable.";
  }
};

// 🔮 ORACLE ENGINE: Natural Language Queries with THINKING MODE
export const queryOracle = async (userQuery: string, contextData: any): Promise<string> => {
  try {
    const ai = getAIClient();
    const prompt = `
      You are the "Oracle", an advanced Predictive Analytics AI for IDC Events.
      
      User Query: "${userQuery}"
      
      Context Data (Available Events):
      ${JSON.stringify(contextData).substring(0, 5000)}
      
      Answer the user's question with deep data-driven insights. 
      Analyze trends, correlations, and potential future outcomes.
      Be professional, authoritative, and exhaustive.
      
      Format as Markdown.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // THINKING MODE MODEL
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }, // MAX THINKING BUDGET
      }
    });

    return response.text || "The Oracle is silent.";
  } catch (error) {
    console.error("Gemini Oracle Error:", error);
    return "## Oracle Offline\nAI Prediction Engine unavailable.";
  }
};

// 💰 REVENUE INTELLIGENCE: Financial Analysis & Optimization
export const generateFinancialAnalysis = async (profile: FinancialProfile): Promise<string> => {
  try {
    const ai = getAIClient();
    const prompt = `
      You are the AI Chief Financial Officer (CFO) for IDC.
      Analyze the financial health of this event based on the P&L data provided.
      
      Event: ${profile.eventName}
      Total Revenue: $${profile.totalRevenue}
      Total Cost: $${profile.totalCost}
      Gross Profit: $${profile.grossProfit} (${profile.marginPercent}% Margin)
      ROI: ${profile.roiPercent}%
      Health Score: ${profile.healthScore}
      
      Breakdown:
      Revenue Streams: ${JSON.stringify(profile.revenueStreams)}
      Cost Centers: ${JSON.stringify(profile.costCenters)}
      
      Your Mission: Provide a strategic financial optimization plan.
      
      Format as Markdown:
      1. **Profitability Verdict**: Assessment of the current margin.
      2. **Revenue Optimization**: 2 specific ways to increase revenue (e.g. Sponsorship upsell, ticket yield management).
      3. **Cost Control Actions**: 2 areas to reduce spend without hurting attendee experience.
      4. **ROI Forecast**: Prediction for final event ROI if actions are taken.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.4,
        maxOutputTokens: 600,
      }
    });
    
    return response.text || "Financial analysis unavailable.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "## Financial Engine Offline\nUnable to process P&L data.";
  }
};

// 🚀 MODULE 11: DEEP MARKETING ENGINE

export const generateMarketingStrategy = async (campaign: MarketingCampaign): Promise<string> => {
  try {
    const ai = getAIClient();
    const prompt = `
      You are the Chief Marketing Officer AI for IDC.
      Review the active campaign and provide a budget reallocation strategy to maximize ROAS.
      
      Campaign: ${campaign.name}
      Status: ${campaign.status}
      Budget: $${campaign.budget} (Spent: $${campaign.spent})
      Current Channels:
      ${JSON.stringify(campaign.channels)}
      
      Task:
      1. Analyze which channel is underperforming (high CPA, low ROAS).
      2. Analyze which channel is winning.
      3. Recommend specific budget shifts (e.g., "Move $5k from Meta to LinkedIn").
      4. Predict the impact on total conversions.
      
      Format as Markdown.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.5,
      }
    });

    return response.text || "Strategy generation unavailable.";
  } catch (error) {
    console.error("Gemini Marketing Error:", error);
    return "## Marketing Strategy Offline";
  }
};

export const generateCreativeSuite = async (eventName: string, persona: MarketingPersona, channel: ContentChannel): Promise<string> => {
  try {
    const ai = getAIClient();
    const prompt = `
      You are the Creative Director AI for IDC Events.
      Generate a high-fidelity ad creative for:
      
      Event: ${eventName}
      Channel: ${channel}
      Target Persona: ${persona.name} (${persona.role})
      Pain Points: ${persona.painPoints.join(', ')}
      
      Output JSON strictly in this format (no markdown code blocks, just raw JSON):
      {
        "headline": "...",
        "primaryText": "...",
        "cta": "...",
        "imageDescription": "...",
        "colorHex": "#003A79"
      }
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.9,
        responseMimeType: "application/json"
      }
    });

    return cleanJson(response.text || "{}");
  } catch (error) {
    console.error("Gemini Creative Error:", error);
    return "{}";
  }
};

// 🤝 MODULE 14: SPONSORSHIP ENGINE

export const generateSponsorshipStrategy = async (pkg: SponsorshipPackage): Promise<string> => {
  try {
    const ai = getAIClient();
    const prompt = `
      You are the Sponsorship Director AI for IDC.
      Optimize the following sponsorship package structure:
      
      Event: ${pkg.eventName}
      Current Tiers: ${JSON.stringify(pkg.tiers)}
      
      Provide a strategic recommendation report:
      1. Pricing Analysis (Are we underpricing Platinum?).
      2. New Asset Ideas (Suggest 2 high-value digital assets to add).
      3. Upsell Strategy (How to move Gold sponsors to Platinum).
      
      Format as Markdown.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { temperature: 0.7 }
    });

    return response.text || "Strategy unavailable.";
  } catch (error) {
    console.error("Gemini Sponsor Error:", error);
    return "## Strategy Offline";
  }
};

export const generateSponsorOutreach = async (sponsor: Sponsor, eventName: string): Promise<string> => {
  try {
    const ai = getAIClient();
    const prompt = `
      You are the Partnership Lead for IDC.
      Write a personalized cold outreach email to this prospective sponsor.
      
      Sponsor: ${sponsor.companyName} (${sponsor.industry})
      Target Event: ${eventName}
      Projected Value: $${sponsor.projectedValue}
      Fit Score: ${sponsor.fitScore}/100
      
      The email must:
      - Be professional yet persuasive.
      - Highlight audience alignment (C-Level Tech Execs).
      - Propose a specific meeting time.
      
      Format as Markdown.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { temperature: 0.8 }
    });

    return response.text || "Email generation failed.";
  } catch (error) {
    console.error("Gemini Outreach Error:", error);
    return "## Outreach Offline";
  }
};

// 🎤 MODULE 15: SPEAKER INTELLIGENCE

export const analyzeSpeakerProfile = async (speaker: Speaker): Promise<string> => {
  try {
    const ai = getAIClient();
    const prompt = `
      You are IDC's Chief Content Officer. Analyze this speaker profile and generate a performance scorecard.
      
      Speaker: ${speaker.name} (${speaker.role} at ${speaker.company})
      Bio: ${speaker.bio}
      Historical Rating: ${speaker.historicalRating}/5
      Engagement Score: ${speaker.engagementScore}/100
      
      Output JSON strictly in this format:
      {
        "authorityScore": 92,
        "charismaScore": 85,
        "retentionPrediction": 88,
        "strengths": ["Deep Technical Knowledge", "Executive Presence"],
        "weaknesses": ["Can be too academic", "Slides too text-heavy"],
        "recommendedTracks": ["Keynote", "Technical Deep Dive"]
      }
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.5,
        responseMimeType: "application/json"
      }
    });

    return cleanJson(response.text || "{}");
  } catch (error) {
    console.error("Gemini Speaker Error:", error);
    return "{}";
  }
};

export const optimizeSessionContent = async (session: Session): Promise<string> => {
  try {
    const ai = getAIClient();
    const prompt = `
      You are an Executive Editor for IDC Events. Optimize this session abstract for maximum C-Level attendance.
      
      Title: "${session.title}"
      Abstract: "${session.abstract}"
      Target Audience: CIOs & CTOs
      
      Output JSON strictly in this format:
      {
        "optimizedTitle": "...",
        "optimizedAbstract": "...",
        "predictedUplift": 15,
        "improvementReason": "Added urgency and ROI focus."
      }
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
        responseMimeType: "application/json"
      }
    });

    return cleanJson(response.text || "{}");
  } catch (error) {
    console.error("Gemini Content Error:", error);
    return "{}";
  }
};

// ⚙️ MODULE 16: LIVE OPS & LOGISTICS

export const generateOpsSolution = async (alert: OpsAlert): Promise<string> => {
  try {
    const ai = getAIClient();
    const prompt = `
      You are the IDC Live Operations Director.
      A critical operational issue has been flagged. Provide an immediate tactical solution.
      
      Alert: ${alert.type} - ${alert.message}
      Severity: ${alert.severity}
      
      Provide a 3-step action plan in JSON format:
      {
        "immediateAction": "...",
        "staffAssignment": "...",
        "communicationProtocol": "..."
      }
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    return cleanJson(response.text || "{}");
  } catch (error) {
    console.error("Gemini Ops Error:", error);
    return "{}";
  }
};

export const generateEmergencyProtocol = async (type: string): Promise<string> => {
  try {
    const ai = getAIClient();
    const prompt = `
      Generate an Emergency Broadcast Message for an event app notification.
      Emergency Type: ${type}
      
      Output JSON:
      {
        "title": "...",
        "body": "...",
        "instruction": "..."
      }
    `;
    
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    return cleanJson(response.text || "{}");
  } catch (error) {
    console.error("Gemini Emergency Error:", error);
    return "{}";
  }
};
