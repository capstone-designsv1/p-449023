import React from "react";
import { Button } from "@/components/ui/button";
import { Headphones, VolumeX } from "lucide-react";
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
  toggleSpeaking,
  hasChatHistory
}) => {
  return (
    <div className="flex justify-center space-x-3 my-2">
      {/* Listen button removed - functionality moved to floating mic button */}
      
      {hasChatHistory && (
        <Button
          variant="outline"
          size="sm"
          onClick={toggleSpeaking}
          className={`transition-colors ${isSpeaking ? 'bg-blue-100 text-blue-700 border-blue-300' : ''}`}
        >
          {isSpeaking ? (
            <>
              <VolumeX className="h-4 w-4 mr-1" /> Stop
            </>
          ) : (
            <>
              <Headphones className="h-4 w-4 mr-1" /> Hear Response
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default VoiceControls;
