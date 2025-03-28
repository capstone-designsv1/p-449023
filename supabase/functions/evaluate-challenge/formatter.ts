
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
  
  // Create evaluation prompt with enhanced structure
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
    
    Your feedback must be SPECIFIC and ACTIONABLE. Follow these guidelines:
    
    1. For strengths:
       - Explain WHY each strength is beneficial
       - Suggest how the candidate can leverage it further
       - Example: "Your systematic approach to breaking down the problem demonstrates strong analytical thinking. To build on this, try adding quantitative metrics to prioritize requirements."
    
    2. For improvements:
       - Provide SPECIFIC suggestions rather than general feedback
       - Offer CONCRETE examples of how to improve
       - Structure suggestions into clear guidance
       - Example: Instead of "Needs better problem framing", say "Your problem framing lacks specificity. Try rewording it as: 'How might we improve the onboarding experience for first-time users by reducing friction in sign-up?'"
    
    3. For weaknesses:
       - Identify the BIGGEST weak point in the submission
       - Provide a step-by-step approach to improve it
       - Example: "Your solution structure lacks clarity. Here's how you can improve it: 1) Start with a brief problem recap (1-2 sentences). 2) List potential approaches with pros/cons. 3) End with a clear recommendation based on feasibility."
    
    4. For next steps:
       - Provide at least two actionable next steps to guide improvement
       - Be specific about what exercises or techniques would help
       - Example: "Try the 10-minute challenge: Redesign a common UI screen in 10 minutes to build speed."
    
    Format your response as a JSON object with the following structure:
    {
      "score": [numeric score between 0-100],
      "feedback": [overall paragraph with feedback, keep it concise and high-level],
      "strengths": [array of 3-5 specific strengths demonstrated by the candidate, each with 'what' and 'why' components],
      "improvements": [array of 3-5 specific areas where the candidate could improve, with concrete examples],
      "weaknesses": {
        "mainWeakness": [the most critical weakness to address],
        "improvementSteps": [array of 3-4 specific steps to improve this main weakness]
      },
      "nextSteps": [array of 2-3 specific, actionable exercises or techniques the candidate can try immediately],
      "actionable": [array of 3-5 specific, actionable steps the candidate can take to improve]
    }
  `;
}
