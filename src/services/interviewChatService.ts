
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

// Helper function to clean and format text from potentially messy JSON data
const cleanupText = (text: string | object | undefined): string => {
  if (!text) return "";
  
  if (typeof text === 'object') {
    // Convert object to string representation
    return JSON.stringify(text);
  }
  
  // Clean up any JSON-like formatting and remove quotes
  return text
    .replace(/^\"+|\"+$/g, '') // Remove surrounding quotes
    .replace(/\\"/g, '"')      // Replace escaped quotes
    .replace(/\\/g, '')        // Remove other escapes
    .trim();
};

// Helper function to format array items into clean bullet points
const formatBulletPoints = (items: any[] | undefined, maxItems: number = 3): string[] => {
  if (!items || !Array.isArray(items)) return [];
  
  return items
    .slice(0, maxItems)
    .map(item => {
      if (typeof item === 'string') {
        return cleanupText(item);
      } else if (typeof item === 'object') {
        // Handle object structures like {what: ..., why: ...}
        if (item.what && item.why) {
          return `${cleanupText(item.what)}. ${cleanupText(item.why)}`;
        }
        return cleanupText(item);
      }
      return String(item);
    });
};

export const endSession = async (
  chatHistory: ChatMessage[], 
  companyName: string, 
  designLevel: string
): Promise<FormattedFeedback> => {
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

    // Process the response data
    let rawFeedback = response.data.feedback || response.data.message;
    let formattedFeedback: FormattedFeedback;
    
    try {
      // If feedback is a JSON string, try to parse it
      if (typeof rawFeedback === 'string' && (rawFeedback.startsWith('{') || rawFeedback.includes('```json'))) {
        // Extract JSON if it's wrapped in markdown code blocks
        if (rawFeedback.includes('```json')) {
          const jsonMatch = rawFeedback.match(/```json\s*([\s\S]*?)\s*```/);
          if (jsonMatch && jsonMatch[1]) {
            rawFeedback = jsonMatch[1];
          }
        }
        
        const parsedFeedback = JSON.parse(rawFeedback);
        
        formattedFeedback = {
          score: typeof parsedFeedback.score === 'number' ? parsedFeedback.score : 75,
          overview: cleanupText(parsedFeedback.feedback || parsedFeedback.overview || ""),
          topPriorities: formatBulletPoints(parsedFeedback.improvements || parsedFeedback.topPriorities, 3),
          strengths: formatBulletPoints(parsedFeedback.strengths, 2),
          nextSteps: formatBulletPoints(parsedFeedback.nextSteps || parsedFeedback.actionable, 2)
        };
      } else {
        // If not parseable as JSON, use raw text and create default structure
        formattedFeedback = {
          score: 75,
          overview: typeof rawFeedback === 'string' ? rawFeedback : JSON.stringify(rawFeedback),
          topPriorities: [
            "Consider incorporating more user research into your design process",
            "Focus on articulating your design decisions more clearly"
          ],
          strengths: [
            "Good understanding of basic design principles",
            "Collaborative approach to problem-solving"
          ],
          nextSteps: [
            "Practice presenting your design solutions more concisely",
            "Try using a structured framework for approaching design challenges"
          ]
        };
      }
    } catch (error) {
      console.error("Error parsing feedback:", error);
      // Fallback to default structure if parsing fails
      formattedFeedback = {
        score: 75,
        overview: typeof rawFeedback === 'string' ? rawFeedback : "Thank you for participating in this interview. Here is your feedback.",
        topPriorities: [
          "Consider incorporating more user research into your design process",
          "Focus on articulating your design decisions more clearly",
          "Practice breaking down complex problems into smaller components"
        ],
        strengths: [
          "Good understanding of basic design principles",
          "Collaborative approach to problem-solving"
        ],
        nextSteps: [
          "Practice presenting your design solutions more concisely",
          "Try using a structured framework for approaching design challenges"
        ]
      };
    }
    
    return formattedFeedback;
  } catch (error) {
    console.error("Error ending session:", error);
    toast.error("Could not generate feedback. Using a default evaluation.");
    
    // Provide fallback evaluation
    return {
      score: 75,
      overview: `Thank you for participating in this design interview for ${companyName}. Overall, you demonstrated good understanding of design principles and approached the problem with a user-centered mindset.`,
      topPriorities: [
        "Consider incorporating more data-driven decision making",
        "Expand on how you would test and validate your solutions",
        "Delve deeper into edge cases and accessibility concerns"
      ],
      strengths: [
        "You showed good communication skills",
        "You demonstrated knowledge of design principles"
      ],
      nextSteps: [
        "Practice articulating your design process more clearly",
        "Try using a structured framework for your next design challenge"
      ]
    };
  }
};
