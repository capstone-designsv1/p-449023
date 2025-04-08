
import React, { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";

interface StickyNoteProps {
  id: string;
  text: string;
  position: { x: number; y: number };
  color: string;
  updatePosition: (id: string, position: { x: number; y: number }) => void;
  updateText: (id: string, text: string) => void;
  deleteNote: (id: string) => void;
}

const StickyNote: React.FC<StickyNoteProps> = ({
  id,
  text,
  position,
  color,
  updatePosition,
  updateText,
  deleteNote
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showConnectors, setShowConnectors] = useState(false);
  const noteRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditText(text);
  }, [text]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditing) return;
    
    const noteRect = noteRef.current?.getBoundingClientRect();
    if (!noteRect) return;
    
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - noteRect.left,
      y: e.clientY - noteRect.top
    });
    
    e.stopPropagation();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const parentRect = noteRef.current?.parentElement?.getBoundingClientRect();
    if (!parentRect) return;
    
    const newX = e.clientX - parentRect.left - dragOffset.x;
    const newY = e.clientY - parentRect.top - dragOffset.y;
    
    updatePosition(id, { x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    setIsEditing(true);
    e.stopPropagation();
  };

  const handleBlur = () => {
    setIsEditing(false);
    updateText(id, editText);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  // Calculate connector positions
  const connectorSize = 8;
  const connectorPositions = [
    { top: "50%", left: -connectorSize / 2, transform: "translateY(-50%)" }, // Left
    { top: "50%", right: -connectorSize / 2, transform: "translateY(-50%)" }, // Right
    { top: -connectorSize / 2, left: "50%", transform: "translateX(-50%)" }, // Top
    { bottom: -connectorSize / 2, left: "50%", transform: "translateX(-50%)" }  // Bottom
  ];

  return (
    <div
      ref={noteRef}
      className="absolute shadow-md w-48 min-h-[6rem] rounded-md z-10 cursor-move"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        backgroundColor: color,
        fontFamily: "Space Grotesk, -apple-system, Roboto, Helvetica, sans-serif"
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setShowConnectors(true)}
      onMouseLeave={() => setShowConnectors(false)}
    >
      <button
        className="absolute top-1 right-1 p-1 rounded-full hover:bg-gray-200 text-gray-600"
        onClick={(e) => {
          e.stopPropagation();
          deleteNote(id);
        }}
      >
        <X size={14} />
      </button>
      
      {isEditing ? (
        <textarea
          ref={textareaRef}
          className="w-full h-full bg-transparent p-3 pt-4 border-none focus:outline-none resize-none"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleBlur}
          style={{ backgroundColor: "transparent", minHeight: "6rem" }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <div className="p-3 pt-4 whitespace-pre-wrap">{text}</div>
      )}

      {/* Connection points */}
      {showConnectors && connectorPositions.map((pos, index) => (
        <div
          key={index}
          className="absolute bg-blue-500 rounded-full border-2 border-white z-20"
          style={{
            width: `${connectorSize}px`,
            height: `${connectorSize}px`,
            ...pos,
            cursor: "crosshair",
          }}
        />
      ))}
    </div>
  );
};

export default StickyNote;
