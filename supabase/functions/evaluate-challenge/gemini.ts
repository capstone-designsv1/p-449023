
import { EvaluationResult } from "./types.ts";

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export async function callGeminiAPI(prompt: string): Promise<EvaluationResult> {
  console.log("Calling Gemini API for evaluation...");
  
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  
  // Call Gemini API with enhanced parameters for better instruction following
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
        temperature: 0.6, // Slightly reduced temperature for more consistent output
        topP: 0.85,
        topK: 40,
        maxOutputTokens: 2048, // Increased token limit for more detailed feedback
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${await response.text()}`);
  }

  const data = await response.json();
  const generatedText = data.candidates[0].content.parts[0].text;

  // Enhanced default evaluation result that follows our structure
  const defaultResult: EvaluationResult = {
    score: 65,
    feedback: "The candidate showed a reasonable understanding of the design challenge. " + 
              "There were some good initial ideas, but the solution could be more comprehensive. " +
              "Consider adding more user-centered design thinking and explaining your rationale more clearly.",
    strengths: [
      "Shows good understanding of basic design concepts and applies them consistently throughout the solution, which helps maintain coherence.",
      "Able to articulate ideas clearly with good use of examples to illustrate points, making your solution easier to understand.",
      "Demonstrated user empathy by considering different user personas and their unique needs, strengthening the user-centered approach."
    ],
    improvements: [
      "Try reframing the problem statement as 'How might we optimize the checkout experience to reduce cart abandonment?' instead of the current generic framing.",
      "When discussing technical constraints, specify actual limitations like 'Must work offline with data synchronization when connection is restored' rather than just mentioning technical feasibility.",
      "Include acceptance criteria for features, such as 'Users should complete checkout in under 30 seconds' to make implementation goals clearer."
    ],
    weaknesses: {
      mainWeakness: "The solution lacks sufficient validation methods and metrics for success",
      improvementSteps: [
        "Define 2-3 key metrics that would indicate success (e.g., reduced drop-off rate, increased conversion)",
        "Suggest A/B testing methodology for critical features with specific test groups",
        "Include a timeline for gathering user feedback and iterating on the design"
      ]
    },
    nextSteps: [
      "Practice the 5-Why technique on your primary user problem to reach deeper insights",
      "Create a competitive analysis of 3-4 similar products to identify gaps and opportunities"
    ],
    actionable: [
      "Break down your design process into distinct phases with clear deliverables for each",
      "Create user flows that account for error states and edge cases",
      "Develop low-fidelity wireframes that focus on information architecture before visual design",
      "Practice explaining your design decisions using the format: problem → approach → rationale → outcome"
    ]
  };
  
  // Try to extract JSON from the response with improved parsing
  try {
    // First try to find JSON object using regex
    let jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    let parsedResult;
    
    if (jsonMatch) {
      try {
        parsedResult = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error("Error parsing JSON directly from response:", e);
        // Try to clean the text before parsing
        const cleanedJson = jsonMatch[0]
          .replace(/(\r\n|\n|\r)/gm, " ")
          .replace(/\s+/g, " ")
          .replace(/\\"/g, '"')
          .replace(/\\'/g, "'");
        
        try {
          parsedResult = JSON.parse(cleanedJson);
        } catch (e2) {
          console.error("Error parsing cleaned JSON:", e2);
          // Fall back to default
        }
      }
    }
    
    // If we successfully parsed the result
    if (parsedResult) {
      // Ensure all expected properties exist in the parsed result with validation
      const result: EvaluationResult = {
        score: typeof parsedResult.score === 'number' ? parsedResult.score : defaultResult.score,
        feedback: typeof parsedResult.feedback === 'string' ? parsedResult.feedback : defaultResult.feedback,
        strengths: Array.isArray(parsedResult.strengths) ? parsedResult.strengths : defaultResult.strengths,
        improvements: Array.isArray(parsedResult.improvements) ? parsedResult.improvements : defaultResult.improvements,
        weaknesses: parsedResult.weaknesses && typeof parsedResult.weaknesses === 'object' ? {
          mainWeakness: typeof parsedResult.weaknesses.mainWeakness === 'string' ? 
            parsedResult.weaknesses.mainWeakness : defaultResult.weaknesses.mainWeakness,
          improvementSteps: Array.isArray(parsedResult.weaknesses.improvementSteps) ? 
            parsedResult.weaknesses.improvementSteps : defaultResult.weaknesses.improvementSteps
        } : defaultResult.weaknesses,
        nextSteps: Array.isArray(parsedResult.nextSteps) ? parsedResult.nextSteps : defaultResult.nextSteps,
        actionable: Array.isArray(parsedResult.actionable) ? parsedResult.actionable : defaultResult.actionable
      };
      
      return result;
    }
  } catch (e) {
    console.error("Error processing Gemini response:", e);
    // Using the default values defined above
  }
  
  return defaultResult;
}
