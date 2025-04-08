
import React, { useState } from "react";
import { Separator } from "@/components/ui/separator";
import ChallengeBrief from "./ChallengeBrief";
import InterviewChat from "./InterviewChat";
import WhiteboardTools from "./WhiteboardTools";
import EvaluationResults from "./EvaluationResults";
import { useChatLogic } from "@/hooks/useChatLogic";
import { useChallengeContext } from "@/context/ChallengeContext";

interface StickyNoteType {
  id: string;
  text: string;
  position: { x: number; y: number };
  color: string;
}

interface ShapeType {
  id: string;
  type: "circle" | "square";
  position: { x: number; y: number };
  color: string;
  size: number;
}

interface ArrowType {
  id: string;
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  color: string;
  startElementId?: string;
  endElementId?: string;
}

interface ChallengeType {
  id: string;
  title: string;
  company: string;
  description: string;
}

interface PracticeScreenProps {
  challenge: ChallengeType;
  notes: StickyNoteType[];
  updateNotePosition: (id: string, position: { x: number; y: number }) => void;
  updateNoteText: (id: string, text: string) => void;
  deleteNote: (id: string) => void;
  onSubmitForEvaluation: (data: any) => void;
  isEvaluating: boolean;
  showResults: boolean;
  evaluationScore: number | null;
  evaluationFeedback: string;
  onCloseResults: () => void;
  canvasRef: (ref: HTMLCanvasElement | null) => void;
  activeTool: "eraser" | "select" | "text" | "arrow" | "circle" | "square";
  setActiveTool: (tool: "eraser" | "select" | "text" | "arrow" | "circle" | "square") => void;
  shapes: ShapeType[];
  updateShapePosition: (id: string, position: { x: number; y: number }) => void;
  deleteShape: (id: string) => void;
  arrows: ArrowType[];
  updateArrow: (id: string, startPoint: { x: number; y: number }, endPoint: { x: number; y: number }) => void;
  addArrow: (startPoint: { x: number; y: number }, endPoint: { x: number; y: number }) => void;
  deleteArrow: (id: string) => void;
}

const PracticeScreen: React.FC<PracticeScreenProps> = ({
  challenge,
  notes,
  updateNotePosition,
  updateNoteText,
  deleteNote,
  onSubmitForEvaluation,
  isEvaluating,
  showResults,
  evaluationScore,
  evaluationFeedback,
  onCloseResults,
  canvasRef,
  activeTool,
  setActiveTool,
  shapes,
  updateShapePosition,
  deleteShape,
  arrows,
  updateArrow,
  addArrow,
  deleteArrow,
}) => {
  const { chatHistory, setChatHistory } = useChallengeContext();
  const { isSending, sendMessage } = useChatLogic(challenge, chatHistory, setChatHistory);

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left side - Challenge brief and chat */}
      <div className="w-1/2 flex flex-col border-r border-gray-200">
        <div className="p-6 overflow-y-auto">
          <ChallengeBrief title="Challenge Brief" description={challenge.description} />
          
          <Separator className="my-6" />
          
          <InterviewChat 
            chatHistory={chatHistory}
            isSending={isSending}
            onSendMessage={sendMessage}
            onSubmitForEvaluation={(data) => onSubmitForEvaluation({ chatHistory })}
            isEvaluating={isEvaluating}
          />
        </div>
      </div>
      
      {/* Right side - Whiteboard area */}
      <div className="w-1/2 flex flex-col">
        <WhiteboardTools
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          canvasRef={canvasRef}
          notes={notes}
          updateNotePosition={updateNotePosition}
          updateNoteText={updateNoteText}
          deleteNote={deleteNote}
          shapes={shapes}
          updateShapePosition={updateShapePosition}
          deleteShape={deleteShape}
          arrows={arrows}
          updateArrow={updateArrow}
          addArrow={addArrow}
          deleteArrow={deleteArrow}
        />
      </div>
      
      {/* Evaluation Results Dialog */}
      <EvaluationResults
        isOpen={showResults}
        onClose={onCloseResults}
        score={evaluationScore}
        feedback={evaluationFeedback}
        isLoading={isEvaluating}
      />
    </div>
  );
};

export default PracticeScreen;
