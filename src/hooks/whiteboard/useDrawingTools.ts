
import { useRef, useState } from "react";
import { WhiteboardTool } from "./useWhiteboardTools";

export interface DrawingPoint {
  x: number;
  y: number;
}

export const useDrawingTools = (context: CanvasRenderingContext2D | null) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPositionRef = useRef<DrawingPoint>({ x: 0, y: 0 });
  
  const clearCanvas = (canvas: HTMLCanvasElement | null) => {
    if (!canvas || !context) return;
    
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    // Removed toast notification for routine canvas clearing
  };
  
  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement | null,
    activeTool: WhiteboardTool
  ) => {
    if (!canvas || !context) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // If double click with eraser tool, clear the entire canvas
    if (e.detail === 2 && activeTool === "eraser") {
      clearCanvas(canvas);
      return;
    }
    
    if (activeTool === "eraser") {
      context.beginPath();
      context.moveTo(x, y);
      setIsDrawing(true);
      lastPositionRef.current = { x, y };
    }
  };
  
  const draw = (
    e: React.MouseEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement | null,
    activeTool: WhiteboardTool
  ) => {
    if (!isDrawing || !context || !canvas || activeTool !== "eraser") return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    context.lineTo(x, y);
    context.stroke();
    
    lastPositionRef.current = { x, y };
  };
  
  const stopDrawing = () => {
    if (isDrawing) {
      context?.closePath();
      setIsDrawing(false);
    }
  };

  return {
    isDrawing,
    startDrawing,
    draw,
    stopDrawing,
    clearCanvas
  };
};
