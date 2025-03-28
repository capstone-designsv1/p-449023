
import React from "react";
import { Button } from "@/components/ui/button";
import { Mic, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

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
      className={cn(
        "transition-colors",
        isVoiceMode && "bg-green-100 text-green-700 border-green-300"
      )}
      onClick={toggleVoiceMode}
      title={isVoiceMode ? "Disable voice mode" : "Enable voice mode"}
    >
      {isVoiceMode 
        ? <Mic className="h-4 w-4" /> 
        : <VolumeX className="h-4 w-4" />
      }
    </Button>
  );
};

export default InterviewVoiceModeToggle;
