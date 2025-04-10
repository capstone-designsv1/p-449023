
import { toast } from "sonner";
import { ChatMessage, FormattedFeedback } from "./types";
import { callInterviewApi } from "./apiService";
import { processRawFeedback, generateFallbackFeedback } from "./feedbackUtils";

/**
 * Initialize a new chat session
 */
export const initializeChat = async (companyName: string, designLevel: string): Promise<ChatMessage> => {
  try {
    console.log(`Initializing chat with company: ${companyName}, level: ${designLevel}`);
    
    const response = await callInterviewApi("start", {
      companyName,
      designLevel
    });

    const aiMessage: ChatMessage = {
      id: `ai-${Date.now()}`,
      role: "assistant",
      content: response.message || "",
      timestamp: new Date()
    };

    return aiMessage;
  } catch (error) {
    console.error("Error initializing chat:", error);
    toast.error("Failed to start the interview. Using a default prompt.");
    
    // Add a fallback first message if API fails
    const fallbackMessage: ChatMessage = {
      id: `ai-${Date.now()}`,
      role: "assistant",
      content: `Hello! I'm a product design interviewer from ${companyName}. Today, I'll be evaluating your design skills for a ${designLevel} position. Let's start with a challenge: Design a feature that would improve user engagement for our core product. Could you walk me through your approach?`,
      timestamp: new Date()
    };
    
    return fallbackMessage;
  }
};

/**
 * Send a message to the AI and get a response
 */
export const sendMessageToAI = async (
  message: string, 
  history: ChatMessage[], 
  companyName: string, 
  designLevel: string
): Promise<ChatMessage> => {
  try {
    console.log(`Sending message to AI with company: ${companyName}, level: ${designLevel}`);
    console.log(`Message: ${message.substring(0, 50)}...`);
    console.log(`History length: ${history.length}`);
    
    const response = await callInterviewApi("chat", {
      companyName,
      designLevel,
      message,
      history: history.map(msg => ({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content
      }))
    });

    const aiMessage: ChatMessage = {
      id: `ai-${Date.now()}`,
      role: "assistant",
      content: response.message || "",
      timestamp: new Date()
    };

    return aiMessage;
  } catch (error) {
    console.error("Error sending message to AI:", error);
    throw error; // Re-throw to let the caller handle it with retries
  }
};

/**
 * End the session and get feedback
 */
export const endSession = async (
  chatHistory: ChatMessage[], 
  companyName: string, 
  designLevel: string
): Promise<FormattedFeedback> => {
  try {
    console.log(`Ending session with company: ${companyName}, level: ${designLevel}`);
    console.log(`Chat history length: ${chatHistory.length}`);
    
    const response = await callInterviewApi("end", {
      companyName,
      designLevel,
      history: chatHistory.map(msg => ({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content
      }))
    });

    // Process the response data
    let rawFeedback = response.feedback || response.message;
    return processRawFeedback(rawFeedback);
  } catch (error) {
    console.error("Error ending session:", error);
    toast.error("Could not generate feedback. Using a default evaluation.");
    
    // Provide fallback evaluation
    return generateFallbackFeedback(companyName);
  }
};
