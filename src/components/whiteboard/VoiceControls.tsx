
import React from "react";
import { ElevenLabsVoice } from "@/hooks/useTextToSpeech";

interface VoiceControlsProps {
  isListening: boolean;
  isSpeaking: boolean;
  isSending: boolean;
  toggleListening: () => void;
  toggleSpeaking: () => void;
  hasChatHistory: boolean;
  currentVoice?: ElevenLabsVoice;
  onChangeVoice?: (voice: ElevenLabsVoice) => void;
}

const VoiceControls: React.FC<VoiceControlsProps> = ({
  isSpeaking,
  isSending,
  hasChatHistory
}) => {
  // We've removed the Hear Response button as the AI will auto-speak
  return (
    <div className="flex justify-center space-x-3 my-2">
      {/* All buttons removed - functionality now handled automatically */}
    </div>
  );
};

export default VoiceControls;
