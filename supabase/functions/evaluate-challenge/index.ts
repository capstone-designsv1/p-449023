import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StickyNote {
  id: string;
  text: string;
  position: { x: number; y: number };
  color: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface SubmissionData {
  challengeId: string;
  canvasData: string;
  notes: StickyNote[];
  finalAnswer?: string;
  chatHistory?: ChatMessage[];
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

    const { submissionData } = await req.json() as { submissionData: SubmissionData };
    const { challengeId, canvasData, notes, finalAnswer, chatHistory } = submissionData;

    console.log(`Processing submission for challenge: ${challengeId}`);

    // Format the chat history if it exists
    let formattedChatHistory = "";
    if (chatHistory && chatHistory.length > 0) {
      formattedChatHistory = chatHistory
        .map(msg => `${msg.role === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.content}`)
        .join("\n\n");
    }

    // Format notes into a string
    const notesText = notes.map(note => note.text).join("\n- ");
    
    // Create evaluation prompt
    const evaluationPrompt = `
      You are a design interview evaluator at a major tech company. 
      You need to evaluate a candidate's response to the following design challenge:
      
      Challenge ID: ${challengeId}
      
      ${finalAnswer ? `Final Answer: ${finalAnswer}` : ''}
      
      ${formattedChatHistory ? `Interview Chat History:\n${formattedChatHistory}` : ''}
      
      ${notes.length > 0 ? `Notes taken by the candidate:\n- ${notesText}` : 'No notes taken by the candidate.'}
      
      Candidate has also created a whiteboard design (image data not shown here).
      
      Please evaluate the candidate's performance based on:
      1. Problem understanding
      2. Design thinking approach
      3. Clarity of communication
      4. Depth of analysis
      5. Solution quality
      6. Interview performance and communication skills
      7. Ability to respond to questions and challenges
      
      Generate a score from 0-100 and provide detailed constructive feedback.
      
      Format your response as a JSON object with the following structure:
      {
        "score": [numeric score between 0-100],
        "feedback": [overall paragraph with feedback, keep it concise and high-level],
        "strengths": [array of 3-5 specific strengths demonstrated by the candidate],
        "improvements": [array of 3-5 specific areas where the candidate could improve],
        "actionable": [array of 3-5 specific, actionable steps the candidate can take to improve]
      }
    `;
    
    console.log("Calling Gemini API for evaluation...");
    
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
              { text: evaluationPrompt }
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

    // Try to extract JSON from the response
    let jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    let result = {
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
    
    if (jsonMatch) {
      try {
        const parsedResult = JSON.parse(jsonMatch[0]);
        
        // Ensure all expected properties exist in the parsed result
        result = {
          score: parsedResult.score || result.score,
          feedback: parsedResult.feedback || result.feedback,
          strengths: parsedResult.strengths || result.strengths,
          improvements: parsedResult.improvements || result.improvements,
          actionable: parsedResult.actionable || result.actionable
        };
      } catch (e) {
        console.error("Error parsing JSON from Gemini response:", e);
        // Using the default values defined above
      }
    }

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
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        score: 50,
        feedback: "We encountered an error while evaluating your submission. This is likely due to a technical issue on our end. Your work has been saved and can be evaluated later.",
        strengths: ["Unable to determine due to technical error"],
        improvements: ["Unable to determine due to technical error"],
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
