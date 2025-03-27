
import React from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";

interface InterviewVoiceModeToggleProps {
  isVoiceMode: boolean;
  toggleVoiceMode: () => void;
}

const InterviewVoiceModeToggle: React.FC<InterviewVoiceModeToggleProps> = ({
  isVoiceMode,
  toggleVoiceMode
}) => {
  return (
    <Button
      variant="outline" 
      size="icon"
      className={`${isVoiceMode ? 'bg-green-100' : ''}`}
      onClick={toggleVoiceMode}
      title={isVoiceMode ? "Disable voice mode" : "Enable voice mode"}
    >
      {isVoiceMode 
        ? <Volume2 className="h-4 w-4 text-green-700" /> 
        : <VolumeX className="h-4 w-4" />
      }
    </Button>
  );
};

export default InterviewVoiceModeToggle;
