
import { FormattedFeedback } from "./types";
import { formatFeedbackItem } from "@/utils/feedbackFormatter";

/**
 * Helper function to clean and format text from potentially messy JSON data
 */
export const cleanupText = (text: string | object | undefined): string => {
  if (!text) return "";
  
  if (typeof text === 'object') {
    // Convert object to string representation
    return JSON.stringify(text);
  }
  
  // Clean up any JSON-like formatting and remove quotes
  return text
    .replace(/^\"+|\"+$/g, '') // Remove surrounding quotes
    .replace(/\\"/g, '"')      // Replace escaped quotes
    .replace(/\\/g, '')        // Remove other escapes
    .trim();
};

/**
 * Helper function to format array items into clean bullet points
 */
export const formatBulletPoints = (items: any[] | undefined, maxItems: number = 3): string[] => {
  if (!items || !Array.isArray(items)) return [];
  
  return items
    .slice(0, maxItems)
    .map(item => {
      if (typeof item === 'string') {
        return cleanupText(item);
      } else if (typeof item === 'object') {
        // Handle object structures like {what: ..., why: ...}
        if (item.what && item.why) {
          return `${cleanupText(item.what)}. ${cleanupText(item.why)}`;
        }
        return cleanupText(item);
      }
      return String(item);
    });
};

/**
 * Process raw feedback data into a structured format
 */
export const processRawFeedback = (rawFeedback: any): FormattedFeedback => {
  try {
    // If feedback is a JSON string, try to parse it
    if (typeof rawFeedback === 'string' && (rawFeedback.startsWith('{') || rawFeedback.includes('```json'))) {
      // Extract JSON if it's wrapped in markdown code blocks
      if (rawFeedback.includes('```json')) {
        const jsonMatch = rawFeedback.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          rawFeedback = jsonMatch[1];
        }
      }
      
      const parsedFeedback = JSON.parse(rawFeedback);
      
      return {
        score: typeof parsedFeedback.score === 'number' ? parsedFeedback.score : 75,
        overview: cleanupText(parsedFeedback.feedback || parsedFeedback.overview || ""),
        topPriorities: formatBulletPoints(parsedFeedback.improvements || parsedFeedback.topPriorities, 3),
        strengths: formatBulletPoints(parsedFeedback.strengths, 2),
        nextSteps: formatBulletPoints(parsedFeedback.nextSteps || parsedFeedback.actionable, 2)
      };
    } else {
      // If not parseable as JSON, use raw text and create default structure
      return {
        score: 75,
        overview: typeof rawFeedback === 'string' ? rawFeedback : JSON.stringify(rawFeedback),
        topPriorities: [
          "Consider incorporating more user research into your design process",
          "Focus on articulating your design decisions more clearly"
        ],
        strengths: [
          "Good understanding of basic design principles",
          "Collaborative approach to problem-solving"
        ],
        nextSteps: [
          "Practice presenting your design solutions more concisely",
          "Try using a structured framework for approaching design challenges"
        ]
      };
    }
  } catch (error) {
    console.error("Error parsing feedback:", error);
    // Fallback to default structure if parsing fails
    return {
      score: 75,
      overview: typeof rawFeedback === 'string' ? rawFeedback : "Thank you for participating in this interview. Here is your feedback.",
      topPriorities: [
        "Consider incorporating more user research into your design process",
        "Focus on articulating your design decisions more clearly",
        "Practice breaking down complex problems into smaller components"
      ],
      strengths: [
        "Good understanding of basic design principles",
        "Collaborative approach to problem-solving"
      ],
      nextSteps: [
        "Practice presenting your design solutions more concisely",
        "Try using a structured framework for approaching design challenges"
      ]
    };
  }
};

/**
 * Generate fallback feedback when API fails
 */
export const generateFallbackFeedback = (companyName: string): FormattedFeedback => {
  return {
    score: 75,
    overview: `Thank you for participating in this design interview for ${companyName}. Overall, you demonstrated good understanding of design principles and approached the problem with a user-centered mindset.`,
    topPriorities: [
      "Consider incorporating more data-driven decision making",
      "Expand on how you would test and validate your solutions",
      "Delve deeper into edge cases and accessibility concerns"
    ],
    strengths: [
      "You showed good communication skills",
      "You demonstrated knowledge of design principles"
    ],
    nextSteps: [
      "Practice articulating your design process more clearly",
      "Try using a structured framework for your next design challenge"
    ]
  };
};
