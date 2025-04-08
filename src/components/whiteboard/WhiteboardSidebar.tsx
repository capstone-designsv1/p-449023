
import React from "react";
import ChatInterface from "./ChatInterface";
import StickyNoteInput from "./StickyNoteInput";
import { useChallengeContext } from "@/context/ChallengeContext";

interface StickyNoteType {
  id: string;
  text: string;
  position: { x: number; y: number };
  color: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface WhiteboardSidebarProps {
  description: string;
  notes: StickyNoteType[];
  setNotes: React.Dispatch<React.SetStateAction<StickyNoteType[]>>;
  onSubmitForEvaluation: (data: { finalAnswer?: string, chatHistory?: ChatMessage[] }) => void;
  isEvaluating: boolean;
}

const WhiteboardSidebar: React.FC<WhiteboardSidebarProps> = ({
  description,
  notes,
  setNotes,
  onSubmitForEvaluation,
  isEvaluating,
}) => {
  return (
    <div className="w-1/2 border-r border-gray-200 bg-white flex flex-col h-[calc(100vh-72px)] overflow-hidden">
      {/* Challenge Brief Section */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-bold mb-3">Challenge Brief</h2>
        <p className="text-gray-700">{description}</p>
      </div>
      
      {/* Interview Partner Section */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 py-4">
          <h2 className="text-lg font-bold">Interview Partner</h2>
        </div>
        <div className="flex-1 overflow-hidden">
          <ChatInterface
            onSubmitForEvaluation={onSubmitForEvaluation}
            isEvaluating={isEvaluating}
          />
        </div>
      </div>
    </div>
  );
};

export default WhiteboardSidebar;
