
import React, { useRef, useState } from "react";
import WhiteboardCanvas from "@/components/whiteboard/WhiteboardCanvas";
import Toolbar from "@/components/whiteboard/Toolbar";
import FloatingMicButton from "@/components/whiteboard/FloatingMicButton";
import TempArrow from "@/components/whiteboard/TempArrow";
import ArrowList from "@/components/whiteboard/ArrowList";
import ShapeList from "@/components/whiteboard/ShapeList";
import StickyNoteList from "@/components/whiteboard/StickyNoteList";
import { toast } from "sonner";

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

interface WhiteboardAreaProps {
  activeTool: "eraser" | "select" | "text" | "arrow" | "circle" | "square" | "note";
  setActiveTool: (tool: "eraser" | "select" | "text" | "arrow" | "circle" | "square" | "note") => void;
  notes: StickyNoteType[];
  updateNotePosition: (id: string, position: { x: number; y: number }) => void;
  updateNoteText: (id: string, text: string) => void;
  deleteNote: (id: string) => void;
  onCanvasRef: (ref: HTMLCanvasElement | null) => void;
  shapes?: ShapeType[];
  updateShapePosition?: (id: string, position: { x: number; y: number }) => void;
  deleteShape?: (id: string) => void;
  arrows?: ArrowType[];
  updateArrow?: (id: string, startPoint: { x: number; y: number }, endPoint: { x: number; y: number }) => void;
  addArrow?: (startPoint: { x: number; y: number }, endPoint: { x: number; y: number }) => void;
  deleteArrow?: (id: string) => void;
  isVoiceMode?: boolean;
  toggleVoiceMode?: () => void;
  addNote?: (position: { x: number; y: number }) => void;
}

const WhiteboardArea: React.FC<WhiteboardAreaProps> = ({
  activeTool,
  setActiveTool,
  notes,
  updateNotePosition,
  updateNoteText,
  deleteNote,
  onCanvasRef,
  shapes = [],
  updateShapePosition = () => {},
  deleteShape = () => {},
  arrows = [],
  updateArrow = () => {},
  addArrow = () => {},
  deleteArrow = () => {},
  isVoiceMode,
  toggleVoiceMode,
  addNote = () => {},
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawingArrow, setIsDrawingArrow] = useState(false);
  const [arrowStart, setArrowStart] = useState({ x: 0, y: 0 });
  const [arrowEnd, setArrowEnd] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (activeTool === "arrow") {
      setArrowStart({ x, y });
      setArrowEnd({ x, y });
      setIsDrawingArrow(true);
    } else if (activeTool === "note") {
      addNote({ x, y });
      toast.success("Sticky note added");
      setActiveTool("select"); // Switch back to select tool after placing a note
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDrawingArrow && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setArrowEnd({ x, y });
    }
  };

  const handleMouseUp = () => {
    if (isDrawingArrow) {
      addArrow(arrowStart, arrowEnd);
      setIsDrawingArrow(false);
    }
  };

  return (
    <div 
      className="flex-1 relative overflow-hidden" 
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <Toolbar activeTool={activeTool} setActiveTool={setActiveTool} />
      <WhiteboardCanvas activeTool={activeTool} onCanvasRef={onCanvasRef} />
      
      {/* Updated floating mic button with additional props */}
      <FloatingMicButton 
        isVoiceMode={isVoiceMode} 
        toggleVoiceMode={toggleVoiceMode}
        isListening={window.isListening} 
        toggleListening={window.toggleListening} 
        isSpeaking={window.isSpeaking} 
      />
      
      {/* Lists of elements */}
      <ArrowList 
        arrows={arrows} 
        updateArrow={updateArrow} 
        deleteArrow={deleteArrow} 
      />
      
      {/* Temporary arrow being drawn */}
      <TempArrow 
        startPoint={arrowStart} 
        endPoint={arrowEnd} 
        isDrawing={isDrawingArrow} 
      />
      
      {/* Shapes */}
      <ShapeList 
        shapes={shapes} 
        updateShapePosition={updateShapePosition} 
        deleteShape={deleteShape} 
      />
      
      {/* Sticky notes */}
      <StickyNoteList 
        notes={notes} 
        updateNotePosition={updateNotePosition} 
        updateNoteText={updateNoteText} 
        deleteNote={deleteNote} 
      />
    </div>
  );
};

export default WhiteboardArea;
