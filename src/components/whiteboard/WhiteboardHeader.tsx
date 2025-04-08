
import React from "react";
import { Button } from "@/components/ui/button";

interface WhiteboardHeaderProps {
  title: string;
  company: string;
  onBackToList: () => void;
}

const WhiteboardHeader: React.FC<WhiteboardHeaderProps> = ({
  title,
  company,
  onBackToList,
}) => {
  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {title || "Loading challenge..."}
          </h1>
          <p className="text-gray-600">{company}</p>
        </div>
        <Button 
          onClick={onBackToList}
          className="bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-full px-5"
        >
          Back to Challenges
        </Button>
      </div>
    </header>
  );
};

export default WhiteboardHeader;
