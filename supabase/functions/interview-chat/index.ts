
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callGeminiAPIWithRetry } from "./geminiService.ts";
import { 
  getStartPrompt, 
  getChatPrompt, 
  getEndPrompt, 
  formatChatHistory,
  getFallbackMessage 
} from "./promptUtils.ts";
import { ChatRequest, InterviewApiResponse } from "./types.ts";
import { GEMINI_API_URL, corsHeaders } from "./constants.ts";

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

serve(async (req) => {
  console.log("Request received:", req.method, req.url);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders 
    });
  }

  try {
    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not set");
      throw new Error("GEMINI_API_KEY is not set");
    }

    const requestData: ChatRequest = await req.json();
    const { action, companyName, designLevel, message, history, industry } = requestData;

    console.log(`Processing ${action} request for ${companyName} at ${designLevel} level in ${industry || 'unspecified'} industry`);

    let systemPrompt = "";
    let responseData: InterviewApiResponse = {};

    switch (action) {
      case "start":
        // Create the initial system prompt
        systemPrompt = getStartPrompt(companyName!, designLevel!, industry);
        responseData = await callGeminiAPIWithRetry(systemPrompt, GEMINI_API_KEY, GEMINI_API_URL);
        break;

      case "chat":
        if (!message || !history) {
          throw new Error("Message and history are required for chat action");
        }
        
        // Format history for context
        const formattedHistory = formatChatHistory(history);
        
        // Build prompt with context and new message
        systemPrompt = getChatPrompt(companyName!, designLevel!, formattedHistory, message, industry);
        responseData = await callGeminiAPIWithRetry(systemPrompt, GEMINI_API_KEY, GEMINI_API_URL);
        break;

      case "end":
        if (!history) {
          throw new Error("History is required for end action");
        }
        
        // Format history for evaluation
        const completeHistory = formatChatHistory(history);
        
        // Build prompt for final evaluation
        systemPrompt = getEndPrompt(companyName!, designLevel!, completeHistory);
        responseData = await callGeminiAPIWithRetry(systemPrompt, GEMINI_API_KEY, GEMINI_API_URL);
        
        // Mark session as ended
        responseData.sessionEnded = true;
        responseData.feedback = responseData.message;
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    console.log("Responding with data:", JSON.stringify(responseData).substring(0, 100) + "...");
    
    return new Response(
      JSON.stringify(responseData),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );

  } catch (error) {
    console.error("Error in interview-chat function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        message: getFallbackMessage(error)
      }),
      { 
        status: 200, // Return 200 even for errors to avoid CORS issues 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );
  }
});
