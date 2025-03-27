
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set");
    }

    const requestData: ChatRequest = await req.json();
    const { action, companyName, designLevel, message, history, industry } = requestData;

    console.log(`Processing ${action} request for ${companyName} at ${designLevel} level, industry: ${industry || 'not specified'}`);

    let systemPrompt = "";
    let userMessage = "";
    let responseData: any = {};

    switch (action) {
      case "start":
        // Create the initial system prompt
        systemPrompt = getStartPrompt(companyName!, designLevel!, industry);
        responseData = await callGeminiAPI(systemPrompt);
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
        responseData = await callGeminiAPI(systemPrompt);
        break;

      case "end":
        if (!history) {
          throw new Error("History is required for end action");
        }
        
        // Format history for evaluation
        const completeHistory = formatChatHistory(history);
        
        // Build prompt for final evaluation
        systemPrompt = getEndPrompt(companyName!, designLevel!, completeHistory, industry);
        responseData = await callGeminiAPI(systemPrompt);
        
        // Mark session as ended
        responseData.sessionEnded = true;
        responseData.feedback = responseData.message;
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

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
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );
  }
});

// Helper function to get the initial prompt
function getStartPrompt(companyName: string, designLevel: string, industry?: string): string {
  // Set default industry to technology if none provided
  const effectiveIndustry = industry || getIndustryFromCompany(companyName);
  
  // Adjust complexity based on design level
  const complexityLevel = getComplexityByLevel(designLevel);
  
  return `You are a senior product design interviewer at ${companyName}. You're conducting a ${designLevel} Product Designer interview focused on the ${effectiveIndustry} industry.
  
Your task is to simulate a realistic product design interview experience focusing on whiteboard challenges and design thinking.

For this first message, introduce yourself briefly as a design interviewer from ${companyName}. Then, present a design challenge appropriate for a ${designLevel} Product Designer with ${complexityLevel} complexity. 

The challenge should be specific to the ${effectiveIndustry} industry and related to ${companyName}'s business domain. Create a scenario that would be realistic for a ${companyName} product designer working in the ${effectiveIndustry} space.

Make the challenge realistic but concise. Ask one clear question to get the candidate started.

IMPORTANT: Keep your response conversational, friendly, and encouraging, but professional. Don't provide guidance on how to answer - this is an assessment.`;
}

// Helper function to get the continuation prompt
function getChatPrompt(companyName: string, designLevel: string, history: string, userMessage: string, industry?: string): string {
  const effectiveIndustry = industry || getIndustryFromCompany(companyName);
  const complexityLevel = getComplexityByLevel(designLevel);
  
  return `You are a senior product design interviewer at ${companyName}. You're conducting a ${designLevel} Product Designer interview focused on the ${effectiveIndustry} industry.

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
- Stay in character as a ${companyName} interviewer in the ${effectiveIndustry} industry
- Maintain ${complexityLevel} complexity appropriate for the ${designLevel} level
- Focus on product thinking, user-centered design, and problem-solving skills
- Ask one clear question at a time
- Don't solve the problem for them
- Be conversational and natural, as in a real interview

Respond as you would in a real interview situation.`;
}

// Helper function to get the final evaluation prompt
function getEndPrompt(companyName: string, designLevel: string, history: string, industry?: string): string {
  const effectiveIndustry = industry || getIndustryFromCompany(companyName);
  
  return `You are a senior product design interviewer at ${companyName}. You've just completed a ${designLevel} Product Designer interview focused on the ${effectiveIndustry} industry.

COMPLETE INTERVIEW HISTORY:
${history}

Now, it's time to provide comprehensive feedback on the candidate's performance. Please analyze the entire interview and provide:

1. A final wrap-up message thanking the candidate for their time
2. A detailed evaluation of their performance, including:
   - Overall assessment (score out of 100)
   - Key strengths demonstrated
   - Areas for improvement
   - Specific examples from their answers that support your evaluation
   - Whether they would likely pass this round in a real interview at ${companyName} for a ${designLevel} role in the ${effectiveIndustry} industry

Focus your evaluation on:
- Problem-solving approach
- Design thinking process
- User-centered focus
- Communication skills
- Handling of ambiguity
- Technical design knowledge appropriate for ${designLevel} level

Make your feedback constructive, balanced, and actionable. Be honest but encouraging.`;
}

// Helper function to determine industry from company if not explicitly provided
function getIndustryFromCompany(companyName: string): string {
  const companyIndustryMap: Record<string, string> = {
    'Uber': 'transportation and delivery',
    'Airbnb': 'hospitality and accommodation',
    'Meta': 'social media and technology',
    'Spotify': 'music streaming',
    'Netflix': 'video streaming',
    'Amazon': 'e-commerce and cloud services',
    'Google': 'search and technology',
    'Apple': 'technology and consumer electronics',
    'Microsoft': 'software and cloud services',
    'Twitter': 'social media',
    'LinkedIn': 'professional networking',
    'Stripe': 'fintech and payments',
    'Shopify': 'e-commerce',
    'Square': 'fintech',
    'DoorDash': 'food delivery',
    'Slack': 'workplace communication',
    'Zoom': 'video conferencing',
  };
  
  return companyIndustryMap[companyName] || 'technology';
}

// Helper function to determine complexity based on design level
function getComplexityByLevel(designLevel: string): string {
  switch (designLevel) {
    case 'Junior':
      return 'low to moderate';
    case 'Senior':
      return 'moderate to high';
    case 'Lead':
      return 'high';
    default:
      return 'moderate';
  }
}

// Helper function to format chat history
function formatChatHistory(history: ChatMessage[]): string {
  return history.map(msg => {
    const role = msg.role === "assistant" ? "INTERVIEWER" : "CANDIDATE";
    return `${role}: ${msg.content}`;
  }).join("\n\n");
}

// Helper function to call the Gemini API
async function callGeminiAPI(prompt: string) {
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
      maxOutputTokens: 1024,
    }
  };

  console.log("Calling Gemini API with prompt");

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Gemini API error:", errorText);
    throw new Error(`Gemini API error: ${errorText}`);
  }

  const data = await response.json();
  const message = data.candidates[0].content.parts[0].text;

  return { message };
}
