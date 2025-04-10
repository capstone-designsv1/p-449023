
/**
 * Parses a potentially JSON-formatted string into a readable format
 * 
 * @param text String that might be a JSON object
 * @returns Formatted string with extracted information
 */
export const parseJsonString = (text: string | null | undefined): string => {
  if (!text) return "";
  
  try {
    // Check if it's a JSON object
    if (text.trim().startsWith('{') && text.trim().endsWith('}')) {
      const parsed = JSON.parse(text);
      
      // Handle specialized JSON structures like {"area": "X", "suggestion": "Y"}
      if (parsed.area && parsed.suggestion) {
        return `${parsed.area}: ${parsed.suggestion}`;
      } 
      
      // Handle structures like {"what": "X", "why": "Y"}
      else if (parsed.what && parsed.why) {
        return `${parsed.what}. ${parsed.why}`;
      }
      
      // Handle generic message/content fields
      else if (parsed.text || parsed.message || parsed.content) {
        return parsed.text || parsed.message || parsed.content;
      }
      
      // If it's another structure, convert to readable string - avoid JSON syntax
      return Object.entries(parsed)
        .map(([key, value]) => `${value}`)
        .join('. ');
    }
    
    // Return original text if not JSON
    return text;
  } catch (e) {
    // If it's not valid JSON, return the original text
    return text;
  }
};

/**
 * Formats any feedback item into a user-friendly string
 * Works with strings, objects, or potentially JSON-formatted strings
 * 
 * @param item Feedback item that might be an object or JSON string
 * @returns Formatted string
 */
export const formatFeedbackItem = (item: any): string => {
  if (!item) return "";
  
  if (typeof item === 'string') {
    return parseJsonString(item);
  } else if (typeof item === 'object') {
    // Handle specialized JSON structures
    if (item.area && item.suggestion) {
      return `${item.area}: ${item.suggestion}`;
    } else if (item.what && item.why) {
      return `${item.what}. ${item.why}`;
    } else if (item.text || item.message || item.content) {
      return item.text || item.message || item.content;
    }
    
    // For other objects, convert to readable text without JSON syntax
    return Object.entries(item)
      .map(([key, value]) => `${value}`)
      .join('. ');
  }
  
  // Handle other types
  return String(item);
};
