
import React, { useRef, useState } from "react";
import WhiteboardCanvas from "@/components/whiteboard/WhiteboardCanvas";
import Toolbar from "@/components/whiteboard/Toolbar";
import StickyNote from "@/components/whiteboard/StickyNote";
import Shape from "@/components/whiteboard/Shape";
import Arrow from "@/components/whiteboard/Arrow";

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
  activeTool: "eraser" | "select" | "text" | "arrow" | "circle" | "square";
  setActiveTool: (tool: "eraser" | "select" | "text" | "arrow" | "circle" | "square") => void;
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
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawingArrow, setIsDrawingArrow] = useState(false);
  const [arrowStart, setArrowStart] = useState({ x: 0, y: 0 });
  const [arrowEnd, setArrowEnd] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeTool === "arrow" && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setArrowStart({ x, y });
      setArrowEnd({ x, y });
      setIsDrawingArrow(true);
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
      
      {/* Render arrows */}
      {arrows.map((arrow) => (
        <Arrow
          key={arrow.id}
          id={arrow.id}
          startPoint={arrow.startPoint}
          endPoint={arrow.endPoint}
          color={arrow.color}
          updateArrow={updateArrow}
          deleteArrow={deleteArrow}
        />
      ))}
      
      {/* Render temporary arrow while drawing */}
      {isDrawingArrow && (
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <line
            x1={arrowStart.x}
            y1={arrowStart.y}
            x2={arrowEnd.x}
            y2={arrowEnd.y}
            stroke="black"
            strokeWidth={2}
            markerEnd="url(#arrowhead)"
          />
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="black" />
            </marker>
          </defs>
        </svg>
      )}
      
      {/* Render shapes */}
      {shapes.map((shape) => (
        <Shape
          key={shape.id}
          id={shape.id}
          type={shape.type}
          position={shape.position}
          color={shape.color}
          size={shape.size}
          updatePosition={updateShapePosition}
          deleteShape={deleteShape}
        />
      ))}
      
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
