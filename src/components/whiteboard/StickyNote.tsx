
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
  const noteRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditing) return;
    
    const noteRect = noteRef.current?.getBoundingClientRect();
    if (!noteRect) return;
    
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - noteRect.left,
      y: e.clientY - noteRect.top
    });
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

  const handleDoubleClick = () => {
    setIsEditing(true);
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
    >
      <button
        className="absolute top-1 right-1 p-1 rounded-full hover:bg-gray-200 text-gray-600"
        onClick={() => deleteNote(id)}
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
        />
      ) : (
        <div className="p-3 pt-4 whitespace-pre-wrap">{text}</div>
      )}
    </div>
  );
};

export default StickyNote;
