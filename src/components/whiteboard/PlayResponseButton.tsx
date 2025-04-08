
import React from "react";
import { Button } from "@/components/ui/button";
import { Headphones, VolumeX } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PlayResponseButtonProps {
  isSpeaking: boolean;
  toggleSpeaking: () => void;
}

const PlayResponseButton: React.FC<PlayResponseButtonProps> = ({
  isSpeaking,
  toggleSpeaking
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSpeaking}
            className={`h-8 w-8 ${isSpeaking ? 'text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Headphones className="h-4 w-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isSpeaking ? "Stop playing" : "Play the AI's voice aloud"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default PlayResponseButton;
