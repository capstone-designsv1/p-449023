
import React from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";

interface InterviewVoiceControlsProps {
  isListening: boolean;
  isSpeaking: boolean;
  isSending: boolean;
  toggleListening: () => void;
  toggleSpeaking: () => void;
  chatHistoryExists: boolean;
}

const InterviewVoiceControls: React.FC<InterviewVoiceControlsProps> = ({
  isListening,
  isSpeaking,
  isSending,
  toggleListening,
  toggleSpeaking,
  chatHistoryExists
}) => {
  return (
    <div className="flex justify-center space-x-3 mb-2">
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
        disabled={!chatHistoryExists}
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

export default InterviewVoiceControls;
