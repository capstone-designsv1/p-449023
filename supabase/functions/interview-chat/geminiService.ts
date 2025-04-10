
import { MAX_RETRIES, RETRY_DELAY_MS } from "./constants.ts";

// Helper function to call the Gemini API with retry logic
export async function callGeminiAPIWithRetry(
  prompt: string,
  apiKey: string,
  apiUrl: string,
  retryCount = 0
): Promise<any> {
  try {
    console.log(`Calling Gemini API (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
    
    const requestBody = {
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
        maxOutputTokens: 100, // Reduced from 1024 to limit the output to approximately 300 characters
      }
    };

    const apiUrlWithKey = `${apiUrl}?key=${apiKey}`;
    console.log(`Making request to: ${apiUrl} (key length: ${apiKey?.length || 0})`);
    
    const response = await fetch(apiUrlWithKey, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });

    console.log(`Gemini API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", errorText);
      
      // Check if we can retry
      if (retryCount < MAX_RETRIES - 1) {
        const delayMs = RETRY_DELAY_MS * Math.pow(2, retryCount); // Exponential backoff
        console.log(`Retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        return callGeminiAPIWithRetry(prompt, apiKey, apiUrl, retryCount + 1);
      }
      
      throw new Error(`Gemini API error: ${errorText}`);
    }

    const data = await response.json();
    console.log("Gemini API response data:", JSON.stringify(data).substring(0, 100) + "...");
    
    if (!data.candidates || data.candidates.length === 0) {
      if (retryCount < MAX_RETRIES - 1) {
        const delayMs = RETRY_DELAY_MS * Math.pow(2, retryCount);
        console.log(`No candidates returned, retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        return callGeminiAPIWithRetry(prompt, apiKey, apiUrl, retryCount + 1);
      }
      
      throw new Error("No response from Gemini API");
    }
    
    let message = data.candidates[0].content.parts[0].text;
    
    // Add an additional check to truncate if the message exceeds 300 characters
    if (message.length > 300) {
      console.log(`Message exceeded 300 characters (${message.length}). Truncating...`);
      message = message.substring(0, 297) + "...";
    }
    
    return { message };
  } catch (error) {
    console.error(`Error calling Gemini API: ${error.message}`);
    
    if (retryCount < MAX_RETRIES - 1) {
      const delayMs = RETRY_DELAY_MS * Math.pow(2, retryCount);
      console.log(`Error: ${error.message}, retrying in ${delayMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
      return callGeminiAPIWithRetry(prompt, apiKey, apiUrl, retryCount + 1);
    }
    
    // If we've used all our retries, generate a fallback response
    console.error(`All ${MAX_RETRIES} attempts failed. Using fallback response.`);
    
    // Return a fallback response based on the action (basic interviewer message)
    return { 
      message: "I'm currently experiencing technical difficulties. Let's proceed with our design interview: Could you tell me about your design process?"
    };
  }
}
