
import React, { useRef } from "react";
import WhiteboardCanvas from "@/components/whiteboard/WhiteboardCanvas";
import Toolbar from "@/components/whiteboard/Toolbar";
import StickyNote from "@/components/whiteboard/StickyNote";

interface StickyNoteType {
  id: string;
  text: string;
  position: { x: number; y: number };
  color: string;
}

interface WhiteboardAreaProps {
  activeTool: "pen" | "eraser" | "select" | "text";
  setActiveTool: (tool: "pen" | "eraser" | "select" | "text") => void;
  notes: StickyNoteType[];
  updateNotePosition: (id: string, position: { x: number; y: number }) => void;
  updateNoteText: (id: string, text: string) => void;
  deleteNote: (id: string) => void;
  onCanvasRef: (ref: HTMLCanvasElement | null) => void;
}

const WhiteboardArea: React.FC<WhiteboardAreaProps> = ({
  activeTool,
  setActiveTool,
  notes,
  updateNotePosition,
  updateNoteText,
  deleteNote,
  onCanvasRef,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex-1 relative overflow-hidden" ref={containerRef}>
      <Toolbar activeTool={activeTool} setActiveTool={setActiveTool} />
      <WhiteboardCanvas activeTool={activeTool} onCanvasRef={onCanvasRef} />
      
      {/* Render sticky notes */}
      {notes.map((note) => (
        <StickyNote
          key={note.id}
          id={note.id}
          text={note.text}
          position={note.position}
          color={note.color}
          updatePosition={updateNotePosition}
          updateText={updateNoteText}
          deleteNote={deleteNote}
        />
      ))}
    </div>
  );
};

export default WhiteboardArea;
