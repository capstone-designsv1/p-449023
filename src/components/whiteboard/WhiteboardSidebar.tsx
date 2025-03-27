
import React, { useState } from "react";
import ChatInterface from "./ChatInterface";
import StickyNoteInput from "./StickyNoteInput";

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
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  return (
    <div className="w-80 border-r border-gray-200 bg-white p-4 flex flex-col h-[calc(100vh-70px)] overflow-y-auto">
      {/* Challenge Brief Section */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Challenge Brief</h2>
        <p className="text-gray-700">{description}</p>
      </div>
      
      {/* Interview Partner Section - Using ChatInterface component */}
      <ChatInterface
        messages={messages}
        setMessages={setMessages}
        onSubmitForEvaluation={onSubmitForEvaluation}
        isEvaluating={isEvaluating}
      />
      
      {/* Sticky Notes Section - Using StickyNoteInput component */}
      <StickyNoteInput
        notes={notes}
        setNotes={setNotes}
      />
    </div>
  );
};

export default WhiteboardSidebar;
