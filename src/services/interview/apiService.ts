
import { supabase } from "@/integrations/supabase/client";
import { InterviewApiResponse } from "./types";

/**
 * Call the interview chat API with the given parameters
 */
export const callInterviewApi = async (
  action: "start" | "chat" | "end",
  params: {
    companyName: string;
    designLevel: string;
    message?: string;
    history?: { role: "assistant" | "user"; content: string }[];
  }
): Promise<InterviewApiResponse> => {
  console.log(`Calling interview API with action: ${action}, company: ${params.companyName}, level: ${params.designLevel}`);

  try {
    const response = await supabase.functions.invoke('interview-chat', {
      body: {
        action,
        companyName: params.companyName,
        designLevel: params.designLevel,
        message: params.message,
        history: params.history,
        chunkResponses: true
      }
    });

    console.log("Function response:", response);

    if (response.error) {
      console.error("Error from function:", response.error);
      throw new Error(response.error.message);
    }

    return response.data;
  } catch (error) {
    console.error(`Error calling interview API with action ${action}:`, error);
    throw error;
  }
};
