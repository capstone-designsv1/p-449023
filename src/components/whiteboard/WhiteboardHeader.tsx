
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

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
        <div className="flex gap-3">
          <Button 
            onClick={onBackToList}
            className="bg-gray-100 text-black border border-gray-300 hover:bg-gray-200"
          >
            Back to Challenges
          </Button>
        </div>
      </div>
    </header>
  );
};

export default WhiteboardHeader;
