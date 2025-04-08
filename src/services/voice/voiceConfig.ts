
/**
 * Configuration utilities for voice services
 */

import { env } from "@/config/env";
import { ELEVEN_LABS_VOICES } from "./voiceTypes";
import type { ElevenLabsVoice } from "./voiceTypes";

/**
 * Checks if ElevenLabs API key is configured
 */
export const isElevenLabsConfigured = (): boolean => {
  return !!env.ELEVEN_LABS_API_KEY && env.ELEVEN_LABS_API_KEY.length > 0;
};

/**
 * Helper function to get voice ID from voice name
 */
export const getVoiceId = (voice: ElevenLabsVoice): string => {
  if (voice === 'custom') {
    return ELEVEN_LABS_VOICES.custom;
  }
  return ELEVEN_LABS_VOICES[voice] || ELEVEN_LABS_VOICES.custom;
};
