
/**
 * Types related to interview chat functionality
 */

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface FormattedFeedback {
  score: number;
  overview: string;
  topPriorities: string[];
  strengths: string[];
  nextSteps: string[];
}

export interface InterviewApiResponse {
  message?: string;
  feedback?: string | object;
  error?: string;
  sessionEnded?: boolean;
}
