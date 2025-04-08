
/**
 * Types and constants for voice services
 */

export type ElevenLabsVoice = 
  | 'alloy'   // Default
  | 'echo'    // Charlie (male)
  | 'fable'   // Domi (female)
  | 'onyx'    // Adam (male)
  | 'nova'    // Sarah (female)
  | 'shimmer'  // Elli (female)
  | 'custom';  // Custom voice ID

// ElevenLabs standard voice IDs for reference
export const ELEVEN_LABS_VOICES = {
  alloy: "pNInz6obpgDQGcFmaJgB",   // Default
  echo: "IKne3meq5aSn9XLyUdCD",    // Charlie (male) 
  fable: "XB0fDUnXU5powFXDhCwa",   // Domi (female)
  onyx: "oWAxZDx7w5VEj9dCyTzz",    // Adam (male)
  nova: "EXAVITQu4vr4xnSDxMaL",    // Sarah (female)
  shimmer: "flq6f7yk4E4fJM5XTYuZ", // Elli (female)
  custom: "F9Nt4wN7louPPlCeLCMN"   // Custom voice ID
};
