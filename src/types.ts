export interface SimulationConfig {
  driver: string;
  personality: string;
  emotion: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  customerType: string;
  traineeName?: string;
  traineeId?: string;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  isResolved?: boolean;
}

export interface Evaluation {
  summary: string;
  pros: string[];
  cons: string[];
  missedOpportunities: string[];
  scores: {
    greeting: number;
    empathy: number;
    probing: number;
    communication: number;
    resolution: number;
  };
  finalScore: number;
  coachingTips: string[];
}

export interface SessionResult {
  id: string;
  userId: string; // Firebase UID
  traineeName: string;
  traineeId: string;
  scenario: string;
  personality: string;
  emotion: string;
  timestamp: string;
  evaluation: Evaluation;
  resolutionStatus: 'Resolved' | 'Not Fully Resolved';
  handlingTime: number; // in seconds
}
