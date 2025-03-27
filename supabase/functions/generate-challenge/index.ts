
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

// Fallback challenge data for when API calls fail
const getFallbackChallenge = (designLevel: string, industry: string) => {
  const id = `fallback-${designLevel.toLowerCase()}-${industry.toLowerCase()}-${Date.now()}`;
  
  // Basic templates by design level
  const templates = {
    "Junior": {
      title: `${industry} Mobile App Redesign`,
      company: `${industry} Tech Solutions`,
      description: `Redesign a key screen of a ${industry.toLowerCase()} mobile application to improve user experience and engagement.`,
      instructions: [
        `Identify and sketch the main user flow for a typical ${industry.toLowerCase()} app task`,
        "Create wireframes for the redesigned screen focusing on usability",
        "Consider accessibility guidelines in your design approach",
        "Explain your design decisions and how they improve the user experience"
      ]
    },
    "Senior": {
      title: `${industry} Platform Information Architecture`,
      company: `${industry} Innovations`,
      description: `Develop an information architecture for a complex ${industry.toLowerCase()} platform that serves multiple user personas.`,
      instructions: [
        "Map out the key user personas and their primary needs",
        "Create a sitemap and user flow diagrams for the platform",
        "Design a navigation system that accommodates different user journeys",
        "Present your reasoning for the IA decisions and how they support business goals"
      ]
    },
    "Lead": {
      title: `${industry} Ecosystem Design Strategy`,
      company: `${industry} Global`,
      description: `Create a comprehensive design strategy for a ${industry.toLowerCase()} digital ecosystem spanning multiple platforms and touchpoints.`,
      instructions: [
        "Define the design principles that would guide the ecosystem development",
        "Map the relationship between different products/services in the ecosystem",
        "Design a consistent experience across various touchpoints",
        "Explain how your strategy addresses business challenges and creates opportunities"
      ]
    }
  };

  // Select template based on design level
  const template = templates[designLevel as keyof typeof templates] || templates["Junior"];
  
  return {
    id,
    title: template.title,
    company: template.company,
    description: template.description,
    instructions: template.instructions
  };
};

// Function to call Gemini API with retry logic
async function callGeminiAPIWithRetry(prompt: string, maxRetries = 3) {
  let retries = 0;
  let lastError = null;

  while (retries < maxRetries) {
    try {
      console.log(`Calling Gemini API (attempt ${retries + 1}/${maxRetries})...`);
      
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

      return responseData;
    } catch (error) {
      console.error(`Attempt ${retries + 1}/${maxRetries} failed:`, error);
      lastError = error;
      retries++;
      
      if (retries < maxRetries) {
        // Exponential backoff with jitter: 1s, ~2s, ~4s
        const delay = Math.floor(1000 * Math.pow(2, retries - 1) * (0.5 + Math.random()));
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error("Failed to call Gemini API after multiple attempts");
}

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

    try {
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

      // Call the Gemini API with retry logic
      const responseData = await callGeminiAPIWithRetry(prompt);
      
      // Extract the generated text
      const generatedText = responseData.candidates[0].content.parts[0].text;
      
      // Parse the JSON from the generated text
      const jsonMatch = generatedText.match(/```json\n([\s\S]*?)\n```/) || 
                        generatedText.match(/{[\s\S]*?}/);
                        
      let challengeData;
      
      if (jsonMatch) {
        const jsonString = jsonMatch[1] || jsonMatch[0];
        try {
          challengeData = JSON.parse(jsonString);
          console.log("Successfully parsed challenge data from API response");
        } catch (parseError) {
          console.error("Failed to parse JSON:", parseError);
          console.log("Falling back to template challenge data");
          challengeData = getFallbackChallenge(designLevel, industry);
        }
      } else {
        console.log("Could not extract JSON from API response, using fallback");
        challengeData = getFallbackChallenge(designLevel, industry);
      }

      // Return the challenge data
      return new Response(
        JSON.stringify(challengeData),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );

    } catch (apiError) {
      console.error("Error calling Gemini API:", apiError);
      
      // Fall back to template-based challenge when API fails
      console.log("Using fallback challenge data due to API failure");
      const fallbackChallenge = getFallbackChallenge(designLevel, industry);
      
      return new Response(
        JSON.stringify(fallbackChallenge),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
  } catch (error) {
    console.error("Error in generate-challenge function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to generate challenge" }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
