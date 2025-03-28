
import { SubmissionData } from "./types.ts";

export function createEvaluationPrompt(submissionData: SubmissionData): string {
  const { challengeId, notes, finalAnswer, chatHistory } = submissionData;
  
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
  return `
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
}
