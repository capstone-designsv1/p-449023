
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
// Update to use Gemini 2.0 Flash
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatRequest {
  action: "start" | "chat" | "end";
  companyName?: string;
  designLevel?: "Junior" | "Senior" | "Lead";
  message?: string;
  history?: ChatMessage[];
  industry?: string;
  chunkResponses?: boolean;
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

serve(async (req) => {
  console.log("Request received:", req.method, req.url);
  
  // Handle CORS preflight requests - this is crucial!
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
    let userMessage = "";
    let responseData: any = {};

    switch (action) {
      case "start":
        // Create the initial system prompt
        systemPrompt = getStartPrompt(companyName!, designLevel!, industry);
        responseData = await callGeminiAPIWithRetry(systemPrompt);
        break;

      case "chat":
        if (!message || !history) {
          throw new Error("Message and history are required for chat action");
        }
        
        // Format history for context
        const formattedHistory = formatChatHistory(history);
        
        // Build prompt with context and new message
        userMessage = message;
        systemPrompt = getChatPrompt(companyName!, designLevel!, formattedHistory, userMessage, industry);
        responseData = await callGeminiAPIWithRetry(systemPrompt);
        break;

      case "end":
        if (!history) {
          throw new Error("History is required for end action");
        }
        
        // Format history for evaluation
        const completeHistory = formatChatHistory(history);
        
        // Build prompt for final evaluation
        systemPrompt = getEndPrompt(companyName!, designLevel!, completeHistory);
        responseData = await callGeminiAPIWithRetry(systemPrompt);
        
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

// Helper function to get a fallback message based on the error
function getFallbackMessage(error: any): string {
  if (error.message.includes("429") || error.message.includes("quota") || error.message.includes("RESOURCE_EXHAUSTED")) {
    return "I'm currently experiencing high demand. Let's continue our conversation shortly. As a design interviewer, I'd like to know more about your approach to user research and how you validate design decisions.";
  } else if (error.message.includes("GEMINI_API_KEY is not set")) {
    return "The interview system is currently being configured. Please try again in a few minutes.";
  } else {
    return "I'm having trouble processing your request. Let's continue our design discussion - could you tell me about a challenging design problem you've solved recently?";
  }
}

// Helper function to get the initial prompt
function getStartPrompt(companyName: string, designLevel: string, industry?: string): string {
  const industryContext = industry ? ` Your company is in the ${industry} industry.` : '';
  
  return `You are a senior product design interviewer at ${companyName}.${industryContext} You're conducting a ${designLevel} Product Designer interview. 
  
Your task is to simulate a realistic product design interview experience focusing on whiteboard challenges and design thinking.

For this first message, introduce yourself briefly as a design interviewer from ${companyName}. Then, present a design challenge appropriate for a ${designLevel} Product Designer. 

The challenge should be specific to ${companyName}'s product space and business. For example, if you're Uber, it might be related to ride-sharing or food delivery. If you're Airbnb, it might be related to accommodations or experiences.

Make the challenge realistic but concise. Ask one clear question to get the candidate started.

IMPORTANT: Keep your response conversational, friendly, and encouraging, but professional. Don't provide guidance on how to answer - this is an assessment.

CRUCIAL: Your response must be less than 300 characters. Be very brief and direct.`;
}

// Helper function to get the continuation prompt
function getChatPrompt(companyName: string, designLevel: string, history: string, userMessage: string, industry?: string): string {
  const industryContext = industry ? ` Your company is in the ${industry} industry.` : '';
  
  return `You are a senior product design interviewer at ${companyName}.${industryContext} You're conducting a ${designLevel} Product Designer interview.

INTERVIEW HISTORY:
${history}

CANDIDATE'S LATEST RESPONSE:
${userMessage}

Your task is to continue the interview naturally. Review the candidate's response and:

1. Acknowledge their answer
2. Ask probing follow-up questions that test deeper design thinking
3. Challenge assumptions where appropriate
4. Guide the discussion toward important design considerations they might have missed

IMPORTANT GUIDELINES:
- Stay in character as a ${companyName} interviewer
- Don't be too easy or too difficult - adjust to the ${designLevel} level
- Focus on product thinking, user-centered design, and problem-solving skills
- Ask one clear question at a time
- Don't solve the problem for them
- Be conversational and natural, as in a real interview

CRUCIAL: Your response must be less than 300 characters. Be very brief and direct.

Respond as you would in a real interview situation.`;
}

// Helper function to get the final evaluation prompt
function getEndPrompt(companyName: string, designLevel: string, history: string): string {
  return `You are a senior product design interviewer at ${companyName}. You've just completed a ${designLevel} Product Designer interview.

COMPLETE INTERVIEW HISTORY:
${history}

Now, it's time to provide comprehensive feedback on the candidate's performance. Please analyze the entire interview and provide:

1. A final wrap-up message thanking the candidate for their time
2. A detailed evaluation of their performance, including:
   - Overall assessment (score out of 100)
   - Key strengths demonstrated
   - Areas for improvement
   - Specific examples from their answers that support your evaluation
   - Whether they would likely pass this round in a real interview at ${companyName}

Focus your evaluation on:
- Problem-solving approach
- Design thinking process
- User-centered focus
- Communication skills
- Handling of ambiguity
- Technical design knowledge appropriate for ${designLevel} level

Make your feedback constructive, balanced, and actionable. Be honest but encouraging.

CRUCIAL: Your response must be less than 300 characters. Be very brief and direct. Only include the most essential feedback.`;
}

// Helper function to format chat history
function formatChatHistory(history: ChatMessage[]): string {
  return history.map(msg => {
    const role = msg.role === "assistant" ? "INTERVIEWER" : "CANDIDATE";
    return `${role}: ${msg.content}`;
  }).join("\n\n");
}

// Helper function to call the Gemini API with retry logic
async function callGeminiAPIWithRetry(prompt: string, retryCount = 0): Promise<any> {
  try {
    console.log(`Calling Gemini API (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
    
    const requestBody = {
      contents: [
        {
          parts: [
            { text: prompt }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 100, // Reduced from 1024 to limit the output to approximately 300 characters
      }
    };

    const apiUrl = `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`;
    console.log(`Making request to: ${GEMINI_API_URL} (key length: ${GEMINI_API_KEY?.length || 0})`);
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });

    console.log(`Gemini API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", errorText);
      
      // Check if we can retry
      if (retryCount < MAX_RETRIES - 1) {
        const delayMs = RETRY_DELAY_MS * Math.pow(2, retryCount); // Exponential backoff
        console.log(`Retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        return callGeminiAPIWithRetry(prompt, retryCount + 1);
      }
      
      throw new Error(`Gemini API error: ${errorText}`);
    }

    const data = await response.json();
    console.log("Gemini API response data:", JSON.stringify(data).substring(0, 100) + "...");
    
    if (!data.candidates || data.candidates.length === 0) {
      if (retryCount < MAX_RETRIES - 1) {
        const delayMs = RETRY_DELAY_MS * Math.pow(2, retryCount);
        console.log(`No candidates returned, retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        return callGeminiAPIWithRetry(prompt, retryCount + 1);
      }
      
      throw new Error("No response from Gemini API");
    }
    
    let message = data.candidates[0].content.parts[0].text;
    
    // Add an additional check to truncate if the message exceeds 300 characters
    if (message.length > 300) {
      console.log(`Message exceeded 300 characters (${message.length}). Truncating...`);
      message = message.substring(0, 297) + "...";
    }
    
    return { message };
  } catch (error) {
    console.error(`Error calling Gemini API: ${error.message}`);
    
    if (retryCount < MAX_RETRIES - 1) {
      const delayMs = RETRY_DELAY_MS * Math.pow(2, retryCount);
      console.log(`Error: ${error.message}, retrying in ${delayMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
      return callGeminiAPIWithRetry(prompt, retryCount + 1);
    }
    
    // If we've used all our retries, generate a fallback response
    console.error(`All ${MAX_RETRIES} attempts failed. Using fallback response.`);
    
    // Return a fallback response based on the action (basic interviewer message)
    return { 
      message: "I'm currently experiencing technical difficulties. Let's proceed with our design interview: Could you tell me about your design process?"
    };
  }
}
