
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { designLevel, industry } = await req.json();
    
    // Validate input parameters
    if (!designLevel || !industry) {
      return new Response(
        JSON.stringify({
          error: "Missing required parameters: designLevel and industry are required"
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Generating challenge for ${designLevel} designer in ${industry} industry`);

    // Format the prompt for the Gemini API
    const prompt = `
      Generate a detailed product design whiteboarding challenge for a ${designLevel} level product designer in the ${industry} industry.
      
      Format the response as a JSON object with these fields:
      - id: A unique identifier (use a random string)
      - title: A catchy, concise title for the challenge
      - company: A relevant company name in the ${industry} industry
      - description: A detailed description of the design challenge (2-3 sentences)
      - instructions: An array of 4 key points that guide the designer through the challenge
      
      The difficulty should be appropriate for a ${designLevel} level designer:
      - Junior: Focus on basic UI/UX concepts and simple user flows
      - Senior: Include more complex interaction patterns and business considerations
      - Lead: Involve strategic thinking, complex systems, and cross-functional considerations
      
      Make the challenge realistic, specific to the ${industry} industry, and include industry-specific terminology.
    `;

    // Call the Gemini API
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent", {
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
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
    });

    const responseData = await response.json();
    console.log("Received response from Gemini API");

    // Extract the generated text
    if (!responseData.candidates || responseData.candidates.length === 0) {
      throw new Error("No response from Gemini API");
    }

    const generatedText = responseData.candidates[0].content.parts[0].text;
    
    // Parse the JSON from the generated text
    const jsonMatch = generatedText.match(/```json\n([\s\S]*?)\n```/) || 
                      generatedText.match(/{[\s\S]*?}/);
                      
    let challengeData;
    
    if (jsonMatch) {
      const jsonString = jsonMatch[1] || jsonMatch[0];
      challengeData = JSON.parse(jsonString);
    } else {
      // Fallback if the response is not properly formatted
      throw new Error("Could not parse JSON from API response");
    }

    // Return the challenge data
    return new Response(
      JSON.stringify(challengeData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error("Error generating challenge:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to generate challenge" }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
