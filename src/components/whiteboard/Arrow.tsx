
import React, { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";

interface ArrowProps {
  id: string;
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  color: string;
  updateArrow: (id: string, startPoint: { x: number; y: number }, endPoint: { x: number; y: number }) => void;
  deleteArrow: (id: string) => void;
}

const Arrow: React.FC<ArrowProps> = ({
  id,
  startPoint,
  endPoint,
  color,
  updateArrow,
  deleteArrow
}) => {
  const [isDraggingStart, setIsDraggingStart] = useState(false);
  const [isDraggingEnd, setIsDraggingEnd] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const arrowRef = useRef<SVGSVGElement>(null);

  const handleStartPointMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDraggingStart(true);
  };

  const handleEndPointMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDraggingEnd(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDraggingStart && !isDraggingEnd) return;
    
    const parentRect = arrowRef.current?.parentElement?.getBoundingClientRect();
    if (!parentRect) return;
    
    const x = e.clientX - parentRect.left;
    const y = e.clientY - parentRect.top;
    
    if (isDraggingStart) {
      updateArrow(id, { x, y }, endPoint);
    } else if (isDraggingEnd) {
      updateArrow(id, startPoint, { x, y });
    }
  };

  const handleMouseUp = () => {
    setIsDraggingStart(false);
    setIsDraggingEnd(false);
  };

  useEffect(() => {
    if (isDraggingStart || isDraggingEnd) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingStart, isDraggingEnd]);

  return (
    <svg 
      ref={arrowRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <line
        x1={startPoint.x}
        y1={startPoint.y}
        x2={endPoint.x}
        y2={endPoint.y}
        stroke={color}
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
          <polygon points="0 0, 10 3.5, 0 7" fill={color} />
        </marker>
      </defs>
      
      {/* Draggable endpoints */}
      <circle
        cx={startPoint.x}
        cy={startPoint.y}
        r={6}
        fill={color}
        className="pointer-events-auto cursor-move"
        onMouseDown={handleStartPointMouseDown}
      />
      
      <circle
        cx={endPoint.x}
        cy={endPoint.y}
        r={6}
        fill={color}
        className="pointer-events-auto cursor-move"
        onMouseDown={handleEndPointMouseDown}
      />
      
      {/* Delete button */}
      {isHovered && (
        <g 
          className="pointer-events-auto cursor-pointer"
          onClick={() => deleteArrow(id)}
          transform={`translate(${(startPoint.x + endPoint.x) / 2 - 10}, ${(startPoint.y + endPoint.y) / 2 - 10})`}
        >
          <circle cx="10" cy="10" r="10" fill="white" />
          <path d="M6,6 L14,14 M14,6 L6,14" stroke={color} strokeWidth="2" />
        </g>
      )}
    </svg>
  );
};

export default Arrow;
