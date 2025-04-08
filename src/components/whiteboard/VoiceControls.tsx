
import React from "react";
import { Button } from "@/components/ui/button";
import { Headphones, VolumeX } from "lucide-react";
import { ElevenLabsVoice } from "@/hooks/useTextToSpeech";

interface VoiceControlsProps {
  isListening: boolean;
  isSpeaking: boolean;
  isSending: boolean;
  toggleSpeaking: () => void;
  hasChatHistory: boolean;
  currentVoice?: ElevenLabsVoice;
  onChangeVoice?: (voice: ElevenLabsVoice) => void;
}

const VoiceControls: React.FC<VoiceControlsProps> = ({
  isSpeaking,
  toggleSpeaking,
  hasChatHistory
}) => {
  return (
    <div className="flex justify-center space-x-3 my-2">
      {hasChatHistory && (
        <Button
          variant="outline"
          size="sm"
          onClick={toggleSpeaking}
          className={`transition-colors ${isSpeaking ? 'bg-blue-100 text-blue-700 border-blue-300' : ''}`}
          title="Play the AI's voice aloud"
        >
          {isSpeaking ? (
            <>
              <VolumeX className="h-4 w-4 mr-1" /> Stop
            </>
          ) : (
            <>
              <Headphones className="h-4 w-4 mr-1" /> Play Response
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default VoiceControls;
