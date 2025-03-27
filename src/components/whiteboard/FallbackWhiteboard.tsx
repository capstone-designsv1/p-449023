
import React from "react";
import WhiteboardCanvas from "./WhiteboardCanvas";
import StickyNote from "./StickyNote";
import Toolbar from "./Toolbar";

interface FallbackWhiteboardProps {
  activeTool: "pen" | "eraser" | "select" | "text";
  setActiveTool: (tool: "pen" | "eraser" | "select" | "text") => void;
  notes: Array<{
    id: string;
    text: string;
    position: { x: number; y: number };
    color: string;
  }>;
  updateNotePosition: (id: string, position: { x: number; y: number }) => void;
  updateNoteText: (id: string, text: string) => void;
  deleteNote: (id: string) => void;
  onCanvasRef: (ref: HTMLCanvasElement | null) => void;
}

const FallbackWhiteboard: React.FC<FallbackWhiteboardProps> = ({
  activeTool,
  setActiveTool,
  notes,
  updateNotePosition,
  updateNoteText,
  deleteNote,
  onCanvasRef,
}) => {
  return (
    <div className="relative w-full h-full">
      <div className="absolute top-0 left-0 w-full py-2 px-4 bg-yellow-100 text-yellow-800 text-center">
        FigJam is currently unavailable. Using backup whiteboard.
      </div>
      
      <div className="pt-10 w-full h-full relative">
        <Toolbar activeTool={activeTool} setActiveTool={setActiveTool} />
        
        <WhiteboardCanvas activeTool={activeTool} onCanvasRef={onCanvasRef} />
        
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
    </div>
  );
};

export default FallbackWhiteboard;
