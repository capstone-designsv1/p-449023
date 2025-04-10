
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
if (!GEMINI_API_KEY) {
  console.error("Missing GEMINI_API_KEY environment variable");
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to call Gemini API with retry logic
async function callGeminiAPIWithRetry(prompt: string, maxRetries = 2) {
  let retries = 0;
  let lastError = null;

  while (retries < maxRetries) {
    try {
      console.log(`Calling Gemini API for time evaluation (attempt ${retries + 1}/${maxRetries})...`);
      
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 256,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Gemini API error (status ${response.status}):`, errorData);
        throw new Error(`Gemini API returned status code ${response.status}`);
      }

      const responseData = await response.json();
      console.log("Received response from Gemini API");

      // Check if the response has valid candidates
      if (!responseData.candidates || responseData.candidates.length === 0) {
        throw new Error("No candidates in Gemini API response");
      }

      const candidate = responseData.candidates[0];
      if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
        throw new Error("Invalid content structure in Gemini API response");
      }

      return candidate.content.parts[0].text;
    } catch (error) {
      console.error(`Attempt ${retries + 1}/${maxRetries} failed:`, error);
      lastError = error;
      retries++;
      
      if (retries < maxRetries) {
        const delay = Math.floor(1000 * Math.pow(2, retries - 1) * (0.5 + Math.random()));
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error("Failed to call Gemini API after multiple attempts");
}

// Function to parse the time from Gemini's response
function parseTimeMinutes(response: string): number {
  try {
    // Look for numbers followed by "minutes" or "min" and extract them
    const timeRegex = /(\d+)(?:\s*(?:minutes|minute|min))/i;
    const match = response.match(timeRegex);
    
    if (match && match[1]) {
      const minutes = parseInt(match[1], 10);
      return minutes > 0 && minutes <= 120 ? minutes : 30; // Default to 30 if outside reasonable range
    }
    
    // If we can't find the pattern, try to extract any number between 20 and 60
    const anyNumberRegex = /(\d+)/;
    const numMatch = response.match(anyNumberRegex);
    if (numMatch && numMatch[1]) {
      const minutes = parseInt(numMatch[1], 10);
      return minutes >= 20 && minutes <= 60 ? minutes : 30;
    }
    
    return 30; // Default if no valid time found
  } catch (error) {
    console.error("Error parsing time from response:", error);
    return 30; // Default to 30 minutes on error
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { challengeDetails } = await req.json();
    
    if (!challengeDetails) {
      return new Response(
        JSON.stringify({ error: "Missing challenge details" }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { title, description, designLevel, industry } = challengeDetails;
    
    // Create prompt for evaluating challenge difficulty and time
    const prompt = `
      As an AI design challenge evaluator, analyze this product design challenge and suggest an appropriate time limit in minutes.
      Consider the following factors:
      - Challenge title: "${title}"
      - Challenge description: "${description}"
      - Designer level: ${designLevel || "Junior"} 
      - Industry: ${industry || "General"}
      
      Most challenges should be between 30-45 minutes, with more complex challenges for senior/lead designers taking longer.
      Junior challenges should generally be 30 minutes.
      Senior challenges should generally be 35-40 minutes.
      Lead challenges with complex systems thinking should be 40-45 minutes.
      
      Keep your response short and direct. Just tell me the recommended time in minutes.
    `;

    try {
      const geminiResponse = await callGeminiAPIWithRetry(prompt);
      console.log("Raw Gemini response:", geminiResponse);
      
      // Parse the time from the response
      const suggestedTimeMinutes = parseTimeMinutes(geminiResponse);
      console.log(`Parsed time: ${suggestedTimeMinutes} minutes`);
      
      return new Response(
        JSON.stringify({ 
          suggestedTimeMinutes,
          rawResponse: geminiResponse
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      
      // Fall back to default time based on design level
      let defaultTime = 30; // Junior default
      if (designLevel === "Senior") defaultTime = 40;
      if (designLevel === "Lead") defaultTime = 45;
      
      return new Response(
        JSON.stringify({ 
          suggestedTimeMinutes: defaultTime,
          error: error.message,
          note: "Using default time based on design level" 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
  } catch (error) {
    console.error("Error in evaluate-challenge-time function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to evaluate challenge time",
        suggestedTimeMinutes: 30 // Default fallback
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
