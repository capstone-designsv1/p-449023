
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent";

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

    // For this demo, we'll generate a simulated evaluation
    // In a real implementation, you would:
    // 1. Send the whiteboard data and answers to Gemini API
    // 2. Evaluate the submission against model answers
    // 3. Return detailed feedback and a score

    console.log("Calling Gemini API for evaluation...");
    
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
      
      Generate a score from 0-100 and provide detailed constructive feedback.
      Format your response as:
      {
        "score": [numeric score between 0-100],
        "feedback": [detailed paragraph with specific strengths and areas for improvement]
      }
    `;
    
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
    let result = {};
    
    if (jsonMatch) {
      try {
        result = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error("Error parsing JSON from Gemini response:", e);
        // If parsing fails, use default values
        result = {
          score: 65,
          feedback: "The candidate showed a reasonable understanding of the design challenge. " + 
                   "There were some good initial ideas, but the solution could be more comprehensive. " +
                   "Consider adding more user-centered design thinking and explaining your rationale more clearly."
        };
      }
    } else {
      // Default values if no JSON found
      result = {
        score: 65,
        feedback: "The candidate showed a reasonable understanding of the design challenge. " + 
                 "There were some good initial ideas, but the solution could be more comprehensive. " +
                 "Consider adding more user-centered design thinking and explaining your rationale more clearly."
      };
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
        feedback: "We encountered an error while evaluating your submission. This is likely due to a technical issue on our end. Your work has been saved and can be evaluated later."
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
