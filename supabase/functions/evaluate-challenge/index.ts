
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SubmissionData, EvaluationResult } from "./types.ts";
import { callGeminiAPI } from "./gemini.ts";
import { createEvaluationPrompt } from "./formatter.ts";

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
    const { submissionData } = await req.json() as { submissionData: SubmissionData };
    
    console.log(`Processing submission for challenge: ${submissionData.challengeId}`);

    // Create evaluation prompt with our improved structure
    const evaluationPrompt = createEvaluationPrompt(submissionData);
    
    // Call Gemini API and get structured evaluation result
    const result = await callGeminiAPI(evaluationPrompt);

    console.log(`Evaluation complete. Score: ${result.score}`);

    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in evaluate-challenge function:', error);
    
    // Return a more informative error response that maintains our structure
    return new Response(
      JSON.stringify({ 
        error: error.message,
        score: 50,
        feedback: "We encountered an error while evaluating your submission. This is likely due to a technical issue on our end. Your work has been saved and can be evaluated later.",
        strengths: ["Unable to determine due to technical error"],
        improvements: ["Unable to determine due to technical error"],
        weaknesses: {
          mainWeakness: "Unable to determine due to technical error",
          improvementSteps: ["Try submitting again in a few minutes"]
        },
        nextSteps: ["Please try submitting again in a few minutes", "If the problem persists, contact support"],
        actionable: ["Please try submitting again in a few minutes"]
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
