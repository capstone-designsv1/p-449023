
import React from "react";

interface TempArrowProps {
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  isDrawing: boolean;
}

const TempArrow: React.FC<TempArrowProps> = ({ startPoint, endPoint, isDrawing }) => {
  if (!isDrawing) return null;
  
  return (
    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
      <line
        x1={startPoint.x}
        y1={startPoint.y}
        x2={endPoint.x}
        y2={endPoint.y}
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
  );
};

export default TempArrow;
