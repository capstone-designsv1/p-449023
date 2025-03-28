
import { EvaluationResult } from "./types.ts";

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export async function callGeminiAPI(prompt: string): Promise<EvaluationResult> {
  console.log("Calling Gemini API for evaluation...");
  
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  
  // Call Gemini API
  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
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
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${await response.text()}`);
  }

  const data = await response.json();
  const generatedText = data.candidates[0].content.parts[0].text;

  // Default evaluation result
  const defaultResult: EvaluationResult = {
    score: 65,
    feedback: "The candidate showed a reasonable understanding of the design challenge. " + 
              "There were some good initial ideas, but the solution could be more comprehensive. " +
              "Consider adding more user-centered design thinking and explaining your rationale more clearly.",
    strengths: [
      "Shows good understanding of basic design concepts",
      "Able to articulate ideas clearly",
      "Demonstrated some user empathy"
    ],
    improvements: [
      "Could explore a wider range of solutions",
      "Need more focus on edge cases",
      "Could provide more justification for design decisions"
    ],
    actionable: [
      "Practice articulating your design process more clearly",
      "Consider user needs more deeply in your solutions",
      "Sketch multiple alternatives before settling on a final solution"
    ]
  };
  
  // Try to extract JSON from the response
  let jsonMatch = generatedText.match(/\{[\s\S]*\}/);
  
  if (jsonMatch) {
    try {
      const parsedResult = JSON.parse(jsonMatch[0]);
      
      // Ensure all expected properties exist in the parsed result
      return {
        score: parsedResult.score || defaultResult.score,
        feedback: parsedResult.feedback || defaultResult.feedback,
        strengths: parsedResult.strengths || defaultResult.strengths,
        improvements: parsedResult.improvements || defaultResult.improvements,
        actionable: parsedResult.actionable || defaultResult.actionable
      };
    } catch (e) {
      console.error("Error parsing JSON from Gemini response:", e);
      // Using the default values defined above
    }
  }
  
  return defaultResult;
}
