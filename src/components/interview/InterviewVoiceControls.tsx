
import React from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, VolumeX, Headphones } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ElevenLabsVoice } from "@/hooks/useTextToSpeech";

interface InterviewVoiceControlsProps {
  isListening: boolean;
  isSpeaking: boolean;
  isSending: boolean;
  toggleListening: () => void;
  toggleSpeaking: () => void;
  chatHistoryExists: boolean;
  currentVoice?: ElevenLabsVoice;
  onChangeVoice?: (voice: ElevenLabsVoice) => void;
}

const voiceNames: Record<ElevenLabsVoice, string> = {
  'alloy': 'Rachel (Female)',
  'echo': 'Charlie (Male)',
  'fable': 'Domi (Female)',
  'onyx': 'Adam (Male)', 
  'nova': 'Sarah (Female)',
  'shimmer': 'Elli (Female)'
};

const InterviewVoiceControls: React.FC<InterviewVoiceControlsProps> = ({
  isListening,
  isSpeaking,
  isSending,
  toggleListening,
  toggleSpeaking,
  chatHistoryExists,
  currentVoice = 'alloy',
  onChangeVoice
}) => {
  return (
    <div className="flex justify-center space-x-3 mb-2">
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
      
      {chatHistoryExists && (
        <>
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
          
          {onChangeVoice && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                >
                  <Volume2 className="h-4 w-4 mr-1" /> {voiceNames[currentVoice]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Select Voice</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(Object.entries(voiceNames) as [ElevenLabsVoice, string][]).map(([id, name]) => (
                  <DropdownMenuItem 
                    key={id}
                    className={currentVoice === id ? "bg-primary/10" : ""}
                    onClick={() => onChangeVoice(id as ElevenLabsVoice)}
                  >
                    {name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </>
      )}
    </div>
  );
};

export default InterviewVoiceControls;
