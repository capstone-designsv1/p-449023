
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ChallengeTimer from "./ChallengeTimer";

interface WhiteboardHeaderProps {
  title: string;
  company: string;
  onBackToList: () => void;
  timeRemaining: string;
  timeRemainingPercentage: number;
  isTimerActive: boolean;
  isTimerLoading: boolean;
  secondsRemaining: number;
}

const WhiteboardHeader: React.FC<WhiteboardHeaderProps> = ({
  title,
  company,
  onBackToList,
  timeRemaining,
  timeRemainingPercentage,
  isTimerActive,
  isTimerLoading,
  secondsRemaining
}) => {
  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={onBackToList}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-semibold">{title}</h1>
          </div>
          <p className="text-sm text-muted-foreground">By {company}</p>
        </div>
        
        <ChallengeTimer 
          timeRemaining={timeRemaining}
          timeRemainingPercentage={timeRemainingPercentage}
          isActive={isTimerActive}
          isLoading={isTimerLoading}
          secondsRemaining={secondsRemaining}
        />
      </div>
    </div>
  );
};

export default WhiteboardHeader;
