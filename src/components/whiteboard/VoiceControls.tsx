
import React from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";

interface VoiceControlsProps {
  isListening: boolean;
  isSpeaking: boolean;
  isSending: boolean;
  toggleListening: () => void;
  toggleSpeaking: () => void;
  hasChatHistory: boolean;
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
        className={`${isListening ? 'bg-red-100 text-red-700 border-red-300' : ''}`}
        onClick={toggleListening}
        disabled={isSending}
      >
        {isListening ? (
          <>
            <MicOff className="h-4 w-4 mr-1" /> Stop Listening
          </>
        ) : (
          <>
            <Mic className="h-4 w-4 mr-1" /> Start Listening
          </>
        )}
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={toggleSpeaking}
        disabled={!hasChatHistory}
        className={isSpeaking ? 'bg-blue-100 text-blue-700 border-blue-300' : ''}
      >
        {isSpeaking ? (
          <>
            <VolumeX className="h-4 w-4 mr-1" /> Stop Speaking
          </>
        ) : (
          <>
            <Volume2 className="h-4 w-4 mr-1" /> Speak Last Message
          </>
        )}
      </Button>
    </div>
  );
};

export default VoiceControls;
