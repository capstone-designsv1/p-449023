
import React, { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";

interface ShapeProps {
  id: string;
  type: "circle" | "square";
  position: { x: number; y: number };
  color: string;
  size: number;
  updatePosition: (id: string, position: { x: number; y: number }) => void;
  deleteShape: (id: string) => void;
}

const Shape: React.FC<ShapeProps> = ({
  id,
  type,
  position,
  color,
  size,
  updatePosition,
  deleteShape
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const shapeRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    const shapeRect = shapeRef.current?.getBoundingClientRect();
    if (!shapeRect) return;
    
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - shapeRect.left,
      y: e.clientY - shapeRect.top
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const parentRect = shapeRef.current?.parentElement?.getBoundingClientRect();
    if (!parentRect) return;
    
    const newX = e.clientX - parentRect.left - dragOffset.x;
    const newY = e.clientY - parentRect.top - dragOffset.y;
    
    updatePosition(id, { x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
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
      ref={shapeRef}
      className={`absolute shadow-md cursor-move ${type === "circle" ? "rounded-full" : ""}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        backgroundColor: color,
        width: `${size}px`,
        height: `${size}px`,
      }}
      onMouseDown={handleMouseDown}
    >
      <button
        className="absolute -top-3 -right-3 p-1 rounded-full bg-white hover:bg-gray-200 text-gray-600 shadow-sm"
        onClick={() => deleteShape(id)}
      >
        <X size={14} />
      </button>
    </div>
  );
};

export default Shape;
