
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
    <div className="w-80 border-r border-gray-200 bg-white p-4 flex flex-col h-[calc(100vh-70px)] overflow-y-auto">
      {/* Challenge Brief Section */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Challenge Brief</h2>
        <p className="text-gray-700">{description}</p>
      </div>
      
      {/* Final Answer Section */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Final Answer</h2>
        <ChatInterface
          onSubmitForEvaluation={onSubmitForEvaluation}
          isEvaluating={isEvaluating}
        />
      </div>
      
      {/* Sticky Notes Section */}
      <StickyNoteInput
        notes={notes}
        setNotes={setNotes}
      />
    </div>
  );
};

export default WhiteboardSidebar;
