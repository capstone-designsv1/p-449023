
import React from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Headphones, VolumeX } from "lucide-react";
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
  isListening,
  isSpeaking,
  isSending,
  toggleListening,
  toggleSpeaking,
  hasChatHistory
}) => {
  return (
    <div className="flex justify-center space-x-3 my-2">
      <Button
        variant="outline"
        size="sm"
        className={`transition-colors ${isListening ? 'bg-red-100 text-red-700 border-red-300' : ''}`}
        onClick={toggleListening}
        disabled={isSending}
      >
        {isListening ? (
          <>
            <MicOff className="h-4 w-4 mr-1" /> Stop Listening
          </>
        ) : (
          <>
            <Mic className="h-4 w-4 mr-1" /> Listen
          </>
        )}
      </Button>
      
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
