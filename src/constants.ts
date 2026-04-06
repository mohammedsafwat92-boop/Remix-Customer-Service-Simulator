export const SCENARIOS = [
  'Samsung Home Appliance Repair Quality Complaint',
  'Repetitive TV Screen Issue (Within same month)',
  'High Out-of-Warranty Mobile Repair Cost',
  'Customer Refusal of In-Home Visit Fees',
  'Spare Parts Delay (Backorder for Samsung AC/Appliance)',
  'Service Center Appointment Delay (Technician Visit)',
  'Samsung.com Order Status Confusion (Canceled without notice)',
  'Escalation Callback Delay (Technical Support Team)',
  'Authorized Service Center Technician Behavior',
  'Warranty Exclusion Dispute (Physical Damage vs. Manufacturing Defect)',
] as const;

export type Scenario = typeof SCENARIOS[number];

export interface PersonalityProfile {
  name: string;
  profile: string;
  behaviors: string;
  risks: string;
  strategy: string;
  skillFocus: string;
}

export interface EmotionalState {
  name: string;
  indicators: string;
  approach: string;
}

export const PERSONALITIES: PersonalityProfile[] = [
  {
    name: 'The Angry / Frustrated Customer',
    profile: 'Emotionally charged, often calling after a negative experience with a Samsung product or service center.',
    behaviors: 'Raises voice, interrupts; uses absolute language (“always”, “never”); focused on venting before resolution',
    risks: 'Escalation to Samsung Gulf HQ or social media; brand loyalty damage',
    strategy: 'Use empathy statements; do not interrupt; acknowledge the issue; keep tone calm and professional',
    skillFocus: 'De-escalation & emotional intelligence'
  },
  {
    name: 'The Confused / Inexperienced Customer',
    profile: 'Lacks technical understanding of Samsung SmartThings or device features; may feel overwhelmed by instructions',
    behaviors: 'Repeated/basic questions; difficulty following troubleshooting steps; hesitant decisions',
    risks: 'Miscommunication; increased handling time; frustration with technology',
    strategy: 'Use simple language; break into steps; confirm understanding; be patient and supportive',
    skillFocus: 'Clarity & instructional communication'
  },
  {
    name: 'The Impatient / Time-Sensitive Customer',
    profile: 'Wants fast results; values efficiency in Samsung service delivery',
    behaviors: 'Interrupts; asks about spare parts arrival time; irritated by scheduling delays',
    risks: 'Call abandonment; low CSAT scores; negative feedback on Google Maps for service centers',
    strategy: 'Be concise; provide clear timelines; avoid small talk; offer the fastest available solution',
    skillFocus: 'Efficiency & time management'
  },
  {
    name: 'The Talkative / Friendly Customer',
    profile: 'Enjoys conversation and may go off-topic while discussing their Samsung ecosystem',
    behaviors: 'Shares personal stories; extends calls; hard to redirect to the technical issue',
    risks: 'Increased handling time; reduced productivity for the Samsung support team',
    strategy: 'Acknowledge then redirect; control flow; stay focused on the service resolution',
    skillFocus: 'Conversation control & tact'
  },
  {
    name: 'The Analytical / Detail-Oriented Customer',
    profile: 'Logical, detail-focused, seeks accuracy regarding Samsung warranty policies and technical specs',
    behaviors: 'Asks detailed questions; challenges warranty terms; requests justification for repair costs',
    risks: 'Long calls; escalation if information is inconsistent with Samsung Gulf policy',
    strategy: 'Provide structured, fact-based explanations; avoid vagueness; be precise with policy details',
    skillFocus: 'Product knowledge & policy adherence'
  }
];

export const EMOTIONAL_STATES: EmotionalState[] = [
  {
    name: 'Angry / Frustrated',
    indicators: 'Raised voice, interruptions; repetitive complaints about Samsung service; blaming language',
    approach: 'Acknowledge emotion explicitly; avoid defensiveness; focus on Samsung service resolution'
  },
  {
    name: 'Confused / Uncertain',
    indicators: 'Repeated questions about Samsung features; hesitation; misunderstanding instructions',
    approach: 'Use simple explanations; break into steps; confirm understanding of Samsung processes'
  },
  {
    name: 'Anxious / Worried',
    indicators: 'Concern about device data loss; nervous tone; repeated reassurance seeking about Samsung warranty',
    approach: 'Provide reassurance with facts; set expectations; stay calm and professional'
  },
  {
    name: 'Impatient / Time-Pressured',
    indicators: 'Interruptions; urgency; pushes for quick answers on Samsung repair status',
    approach: 'Be concise; prioritize key info; offer quick Samsung service solutions'
  },
  {
    name: 'Calm / Neutral',
    indicators: 'Cooperative tone; clear communication; open to Samsung guidance',
    approach: 'Stay professional; build rapport; aim to exceed Samsung service standards'
  }
];

export function normalizeScenario(scenario: string): Scenario {
  const lower = scenario.toLowerCase();
  
  if (lower.includes('repair quality') || lower.includes('appliance')) return SCENARIOS[0];
  if (lower.includes('repetitive') || lower.includes('tv screen')) return SCENARIOS[1];
  if (lower.includes('high repair cost') || lower.includes('mobile repair')) return SCENARIOS[2];
  if (lower.includes('refuse to pay') || lower.includes('visit fees')) return SCENARIOS[3];
  if (lower.includes('long repair time') || lower.includes('spare parts') || lower.includes('backorder')) return SCENARIOS[4];
  if (lower.includes('delay in the repair visit') || lower.includes('appointment delay')) return SCENARIOS[5];
  if (lower.includes('canceled') || lower.includes('samsung.com')) return SCENARIOS[6];
  if (lower.includes('callback') || lower.includes('technical support')) return SCENARIOS[7];
  if (lower.includes('behavior') || lower.includes('technician')) return SCENARIOS[8];
  if (lower.includes('warranty exclusion') || lower.includes('physical damage')) return SCENARIOS[9];

  return SCENARIOS[0];
}

export function normalizePersonality(personality: string): string {
  const lower = personality.toLowerCase();
  if (lower.includes('angry') || lower.includes('frustrated')) return PERSONALITIES[0].name;
  if (lower.includes('confused') || lower.includes('inexperienced')) return PERSONALITIES[1].name;
  if (lower.includes('impatient') || lower.includes('time')) return PERSONALITIES[2].name;
  if (lower.includes('talkative') || lower.includes('friendly')) return PERSONALITIES[3].name;
  if (lower.includes('analytical') || lower.includes('detail')) return PERSONALITIES[4].name;
  return PERSONALITIES[0].name;
}

export function normalizeEmotion(emotion: string): string {
  const lower = emotion.toLowerCase();
  if (lower.includes('angry') || lower.includes('frustrated')) return EMOTIONAL_STATES[0].name;
  if (lower.includes('confused') || lower.includes('uncertain')) return EMOTIONAL_STATES[1].name;
  if (lower.includes('anxious') || lower.includes('worried')) return EMOTIONAL_STATES[2].name;
  if (lower.includes('impatient') || lower.includes('time')) return EMOTIONAL_STATES[3].name;
  if (lower.includes('calm') || lower.includes('neutral')) return EMOTIONAL_STATES[4].name;
  return EMOTIONAL_STATES[0].name;
}
