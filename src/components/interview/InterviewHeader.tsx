
import React from "react";
import { Button } from "@/components/ui/button";

interface InterviewHeaderProps {
  companyName: string;
  handleBackToList: () => void;
}

const InterviewHeader: React.FC<InterviewHeaderProps> = ({
  companyName,
  handleBackToList
}) => {
  return (
    <div className="bg-white border-b border-gray-200 py-3 px-6 flex justify-between items-center">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold">{`Design Interview: ${companyName}`}</h1>
      </div>
      <Button 
        variant="outline" 
        onClick={handleBackToList}
        className="border border-gray-300"
      >
        Back to Challenges
      </Button>
    </div>
  );
};

export default InterviewHeader;
