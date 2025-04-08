import React from "react";
import ChatInterface from "./ChatInterface";

interface StickyNoteType {
  id: string;
  text: string;
  position: { x: number; y: number };
  color: string;
}

interface WhiteboardSidebarProps {
  description: string;
  notes: StickyNoteType[];
  setNotes: React.Dispatch<React.SetStateAction<StickyNoteType[]>>;
  onSubmitForEvaluation: (data: any) => void;
  isEvaluating: boolean;
  isVoiceMode?: boolean;
  toggleVoiceMode?: () => void;
}

const WhiteboardSidebar: React.FC<WhiteboardSidebarProps> = ({
  description,
  notes,
  setNotes,
  onSubmitForEvaluation,
  isEvaluating,
  isVoiceMode,
  toggleVoiceMode
}) => {
  return (
    <div className="w-96 border-r border-gray-200 bg-white p-4 overflow-y-auto flex flex-col">
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Challenge Description</h2>
        <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
          {description}
        </div>
      </div>
      
      <ChatInterface 
        onSubmitForEvaluation={onSubmitForEvaluation} 
        isEvaluating={isEvaluating}
        isVoiceMode={isVoiceMode}
        toggleVoiceMode={toggleVoiceMode}
      />
    </div>
  );
};

export default WhiteboardSidebar;
