
import React, { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Clock, AlertCircle } from "lucide-react";

interface ChallengeTimerProps {
  timeRemaining: string;
  timeRemainingPercentage: number;
  isActive: boolean;
  isLoading: boolean;
}

const ChallengeTimer: React.FC<ChallengeTimerProps> = ({
  timeRemaining,
  timeRemainingPercentage,
  isActive,
  isLoading
}) => {
  const [isWarning, setIsWarning] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  
  // Update warning states based on percentage
  useEffect(() => {
    setIsWarning(timeRemainingPercentage <= 30);
    setIsUrgent(timeRemainingPercentage <= 10);
  }, [timeRemainingPercentage]);

  // Determine the appropriate color based on time remaining
  const getProgressColor = () => {
    if (isUrgent) return "bg-red-500";
    if (isWarning) return "bg-amber-500";
    return "bg-green-500";
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border shadow-sm">
            {isUrgent ? (
              <AlertCircle className="h-4 w-4 text-red-500 animate-pulse" />
            ) : (
              <Clock className={`h-4 w-4 ${isWarning ? "text-amber-500" : "text-green-500"}`} />
            )}
            
            <div className="flex flex-col gap-1 min-w-[80px]">
              {isLoading ? (
                <div className="h-5 w-16 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                <span className={`font-bold ${isUrgent ? "text-red-600 animate-pulse" : isWarning ? "text-amber-600" : "text-green-700"}`}>
                  {timeRemaining}
                </span>
              )}
              
              <Progress 
                value={timeRemainingPercentage} 
                className="h-1.5 w-full bg-gray-200"
                indicatorClassName={getProgressColor()}
              />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {isLoading ? (
            <p>Calculating challenge time...</p>
          ) : isActive ? (
            <p>Time remaining for this challenge</p>
          ) : (
            <p>Challenge time has expired</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ChallengeTimer;
