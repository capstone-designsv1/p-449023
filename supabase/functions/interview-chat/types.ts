
/**
 * Interface for a chat message
 */
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Interface for a chat request
 */
export interface ChatRequest {
  action: "start" | "chat" | "end";
  companyName?: string;
  designLevel?: "Junior" | "Senior" | "Lead";
  message?: string;
  history?: ChatMessage[];
  industry?: string;
  chunkResponses?: boolean;
}

/**
 * Interface for the response data
 */
export interface InterviewApiResponse {
  message?: string;
  feedback?: string;
  error?: string;
  sessionEnded?: boolean;
}
