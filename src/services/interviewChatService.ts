
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export const initializeChat = async (companyName: string, designLevel: string): Promise<ChatMessage> => {
  try {
    console.log(`Initializing chat with company: ${companyName}, level: ${designLevel}`);
    
    const response = await supabase.functions.invoke('interview-chat', {
      body: {
        action: "start",
        companyName,
        designLevel
      }
    });

    console.log("Function response:", response);

    if (response.error) {
      console.error("Error from function:", response.error);
      throw new Error(response.error.message);
    }

    const aiMessage: ChatMessage = {
      id: `ai-${Date.now()}`,
      role: "assistant",
      content: response.data.message,
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
    
    const response = await supabase.functions.invoke('interview-chat', {
      body: {
        action: "chat",
        message,
        history: history.map(msg => ({
          role: msg.role === "assistant" ? "assistant" : "user",
          content: msg.content
        })),
        companyName,
        designLevel
      }
    });

    console.log("Function response:", response);

    if (response.error) {
      console.error("Error from function:", response.error);
      throw new Error(response.error.message);
    }

    const aiMessage: ChatMessage = {
      id: `ai-${Date.now()}`,
      role: "assistant",
      content: response.data.message,
      timestamp: new Date()
    };

    return aiMessage;
  } catch (error) {
    console.error("Error sending message to AI:", error);
    toast.error("Failed to get a response. Please try again.");
    throw error; // Re-throw to let the caller handle it with retries
  }
};

export const endSession = async (
  chatHistory: ChatMessage[], 
  companyName: string, 
  designLevel: string
): Promise<string> => {
  try {
    console.log(`Ending session with company: ${companyName}, level: ${designLevel}`);
    console.log(`Chat history length: ${chatHistory.length}`);
    
    const response = await supabase.functions.invoke('interview-chat', {
      body: {
        action: "end",
        history: chatHistory.map(msg => ({
          role: msg.role === "assistant" ? "assistant" : "user",
          content: msg.content
        })),
        companyName,
        designLevel
      }
    });

    console.log("Function response:", response);

    if (response.error) {
      console.error("Error from function:", response.error);
      throw new Error(response.error.message);
    }

    const feedback = response.data.feedback || response.data.message;
    return feedback;
  } catch (error) {
    console.error("Error ending session:", error);
    toast.error("Could not generate feedback. Using a default evaluation.");
    
    // Provide fallback evaluation
    const fallbackFeedback = `Thank you for participating in this design interview for ${companyName}. 

Based on our conversation, here's my evaluation:

Overall Score: 75/100

Strengths:
- You showed good communication skills
- You demonstrated knowledge of design principles
- You approached the problem with a user-centered mindset

Areas for Improvement:
- Consider incorporating more data-driven decision making
- Expand on how you would test and validate your solutions
- Delve deeper into edge cases and accessibility concerns

This is a simplified evaluation as we're currently experiencing technical difficulties. In a real interview setting, we would provide more specific feedback based on your answers.`;
    
    return fallbackFeedback;
  }
};
