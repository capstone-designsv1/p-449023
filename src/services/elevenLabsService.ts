
/**
 * ElevenLabs text-to-speech service integration
 */

// Re-export all the functionality from the refactored modules
export { 
  type ElevenLabsVoice,
  ELEVEN_LABS_VOICES 
} from "./voice/voiceTypes";

export { 
  isElevenLabsConfigured,
  getVoiceId 
} from "./voice/voiceConfig";

export { 
  textToSpeech 
} from "./voice/textToSpeech";

export { 
  playVoiceResponse 
} from "./voice/audioPlayback";
