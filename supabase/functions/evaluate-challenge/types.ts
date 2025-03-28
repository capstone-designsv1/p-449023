
export interface StickyNote {
  id: string;
  text: string;
  position: { x: number; y: number };
  color: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface SubmissionData {
  challengeId: string;
  canvasData: string;
  notes: StickyNote[];
  finalAnswer?: string;
  chatHistory?: ChatMessage[];
}

export interface EvaluationResult {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  actionable: string[];
  weaknesses: {
    mainWeakness: string;
    improvementSteps: string[];
  };
  nextSteps: string[];
}
