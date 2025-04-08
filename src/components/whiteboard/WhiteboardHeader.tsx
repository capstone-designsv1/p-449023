
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
    <header className="bg-white border-b border-gray-200 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[rgba(25,26,35,1)]">
            {title || "Loading challenge..."}
          </h1>
          <p className="text-gray-600">{company}</p>
        </div>
        <div>
          <Button 
            onClick={onBackToList}
            className="bg-gray-100 hover:bg-gray-200 text-black rounded-full px-6 py-2"
          >
            Back to Challenges
          </Button>
        </div>
      </div>
    </header>
  );
};

export default WhiteboardHeader;
