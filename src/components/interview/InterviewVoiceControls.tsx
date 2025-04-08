
import React from "react";
import { Button } from "@/components/ui/button";
import { Headphones, VolumeX } from "lucide-react";
import { ElevenLabsVoice } from "@/hooks/useTextToSpeech";

interface InterviewVoiceControlsProps {
  isSpeaking: boolean;
  toggleSpeaking: () => void;
  chatHistoryExists: boolean;
  currentVoice?: ElevenLabsVoice;
  onChangeVoice?: (voice: ElevenLabsVoice) => void;
}

const InterviewVoiceControls: React.FC<InterviewVoiceControlsProps> = ({
  isSpeaking,
  toggleSpeaking,
  chatHistoryExists
}) => {
  return (
    <div className="flex justify-center space-x-3 mb-2">
      {chatHistoryExists && (
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

export default InterviewVoiceControls;
