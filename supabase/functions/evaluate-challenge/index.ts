
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent";

interface SubmissionData {
  challengeId: string;
  userId?: string;
  canvasData: string;
  notes: { id: string; text: string; position: { x: number; y: number } }[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Get the current user's ID
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError) {
      console.error("Error getting user:", userError.message);
    }

    const { submissionData, submissionId }: { submissionData: SubmissionData, submissionId?: string } = await req.json();
    const { challengeId, canvasData, notes } = submissionData;

    console.log("Processing submission for challenge:", challengeId);
    
    // Get challenge details to use in evaluation prompt
    const challengeDetails = getChallengeDetails(challengeId);
    
    if (!challengeDetails) {
      return new Response(
        JSON.stringify({ error: "Challenge not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Format notes for the AI prompt
    const formattedNotes = notes.map(note => `- ${note.text}`).join("\n");
    
    // Create the AI prompt
    const prompt = {
      contents: [
        {
          parts: [
            { 
              text: `You are an expert UX design evaluator. Evaluate the following submission for a design challenge.

CHALLENGE: ${challengeDetails.title} - ${challengeDetails.company}
CHALLENGE DESCRIPTION: ${challengeDetails.description}

INSTRUCTIONS:
${challengeDetails.instructions.join("\n")}

USER SUBMISSION:
The user created a whiteboard design for this challenge.
${notes.length > 0 ? `The user's notes included:\n${formattedNotes}` : "The user did not include any notes."}
${canvasData ? "The user created a sketch/wireframe on the canvas." : "The user did not create any sketch on the canvas."}

EVALUATION TASK:
1. Score this submission on a scale of 1-100 based on how well it addresses the challenge requirements.
2. Provide detailed, constructive feedback explaining the strengths and weaknesses of the submission.
3. Include specific suggestions for improvement.
4. Format your response in two parts: 
   - SCORE: (just the number)
   - FEEDBACK: (your detailed evaluation)
` 
            }
          ]
        }
      ]
    };

    // Call Gemini API
    console.log("Calling Gemini API for evaluation...");
    const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prompt)
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini API error:", errorText);
      throw new Error(`Gemini API error: ${errorText}`);
    }

    const geminiData = await geminiResponse.json();
    const evaluationText = geminiData.candidates[0].content.parts[0].text;
    
    // Parse the score and feedback from the AI response
    const scoreMatch = evaluationText.match(/SCORE:\s*(\d+)/i);
    const feedbackMatch = evaluationText.match(/FEEDBACK:([\s\S]+)/i);
    
    const score = scoreMatch ? parseInt(scoreMatch[1]) : null;
    const feedback = feedbackMatch ? feedbackMatch[1].trim() : evaluationText;

    console.log(`Evaluation complete. Score: ${score}`);

    // Save to database if we have a submissionId
    if (submissionId) {
      const { error: updateError } = await supabaseClient
        .from('challenge_submissions')
        .update({
          evaluation_score: score,
          evaluation_feedback: feedback,
          evaluation_status: 'completed'
        })
        .eq('id', submissionId);

      if (updateError) {
        console.error("Error updating submission:", updateError.message);
        throw new Error(`Error updating submission: ${updateError.message}`);
      }
    } else {
      // Create a new submission entry
      const { error: insertError } = await supabaseClient
        .from('challenge_submissions')
        .insert({
          user_id: user?.id,
          challenge_id: challengeId,
          canvas_data: canvasData,
          notes: notes,
          evaluation_score: score,
          evaluation_feedback: feedback,
          evaluation_status: 'completed'
        });

      if (insertError) {
        console.error("Error inserting submission:", insertError.message);
        throw new Error(`Error inserting submission: ${insertError.message}`);
      }
    }

    return new Response(
      JSON.stringify({ score, feedback }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in evaluation:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Helper function to get challenge details
function getChallengeDetails(challengeId: string) {
  const challengeDetails = {
    "uber-1": {
      id: "uber-1",
      title: "Redesign the Ride Ordering Experience",
      company: "Uber",
      description: "Create a simplified ride ordering flow that improves the user experience for first-time users.",
      instructions: [
        "Start by identifying the pain points in the current flow",
        "Sketch the main screens of your new design",
        "Focus on simplifying the process for new users",
        "Consider accessibility in your design"
      ]
    },
    "airbnb-1": {
      id: "airbnb-1",
      title: "Design a New Feature for Hosts",
      company: "Airbnb",
      description: "Design a feature that helps hosts better manage their property bookings and guest communications.",
      instructions: [
        "Research the current host experience",
        "Identify key pain points for hosts",
        "Sketch your solution's main flows",
        "Consider how this integrates with the existing platform"
      ]
    },
    "meta-1": {
      id: "meta-1",
      title: "Improve Group Interaction in VR",
      company: "Meta",
      description: "Conceptualize improvements to how users interact in group settings within a VR environment.",
      instructions: [
        "Define the current limitations of group interactions in VR",
        "Sketch new interaction models",
        "Consider both verbal and non-verbal communication",
        "Think about how to make interactions feel natural"
      ]
    },
    "uber-2": {
      id: "uber-2",
      title: "Design for Accessibility",
      company: "Uber",
      description: "Improve accessibility of the app for users with visual impairments.",
      instructions: [
        "Identify key accessibility issues in the current app",
        "Sketch solutions that address these issues",
        "Consider how your solutions benefit all users",
        "Think about implementation feasibility"
      ]
    },
    "airbnb-2": {
      id: "airbnb-2",
      title: "Streamline the Booking Process",
      company: "Airbnb",
      description: "Simplify the booking flow to reduce drop-offs and increase conversion.",
      instructions: [
        "Map out the current booking flow",
        "Identify steps that cause user drop-off",
        "Sketch a streamlined flow",
        "Consider how to maintain necessary information gathering"
      ]
    },
    "meta-2": {
      id: "meta-2",
      title: "Cross-Platform Design System",
      company: "Meta",
      description: "Design a system that maintains consistent user experience across mobile, desktop, and VR.",
      instructions: [
        "Define the core elements of your design system",
        "Sketch how components adapt across platforms",
        "Consider the unique constraints of each platform",
        "Demonstrate how your system maintains brand consistency"
      ]
    }
  };

  return challengeDetails[challengeId];
}
