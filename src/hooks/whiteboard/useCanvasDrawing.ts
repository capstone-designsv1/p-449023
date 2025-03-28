
import { useRef, useState } from "react";
import { WhiteboardTool } from "./useWhiteboardTools";
import { ShapeDrawingService } from "@/services/ShapeDrawingService";

interface CanvasDrawingState {
  isDrawing: boolean;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export const useCanvasDrawing = (context: CanvasRenderingContext2D | null) => {
  const [drawingState, setDrawingState] = useState<CanvasDrawingState>({
    isDrawing: false,
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0
  });
  
  // Backup canvas state for shape preview
  const imageDataRef = useRef<ImageData | null>(null);
  
  const startShape = (x: number, y: number, canvas: HTMLCanvasElement) => {
    if (!context) return;
    
    // Store current canvas state to restore when previewing shapes
    imageDataRef.current = context.getImageData(0, 0, canvas.width, canvas.height);
    
    setDrawingState({
      isDrawing: true,
      startX: x,
      startY: y,
      endX: x,
      endY: y
    });
  };
  
  const previewShape = (x: number, y: number, tool: WhiteboardTool, canvas: HTMLCanvasElement) => {
    if (!context || !imageDataRef.current || !drawingState.isDrawing) return;
    
    // Restore canvas to state before drawing began
    context.putImageData(imageDataRef.current, 0, 0);
    
    const options = {
      strokeColor: tool === "eraser" ? "#ffffff" : "#000000",
      strokeWidth: tool === "eraser" ? 20 : 2,
      fillColor: "rgba(0,0,0,0.1)"
    };
    
    switch (tool) {
      case "circle":
        const radius = Math.sqrt(
          Math.pow(x - drawingState.startX, 2) + Math.pow(y - drawingState.startY, 2)
        );
        ShapeDrawingService.drawCircle(
          context, 
          drawingState.startX, 
          drawingState.startY, 
          radius, 
          options
        );
        break;
      case "square":
        const size = Math.max(
          Math.abs(x - drawingState.startX),
          Math.abs(y - drawingState.startY)
        );
        ShapeDrawingService.drawSquare(
          context, 
          drawingState.startX, 
          drawingState.startY, 
          size, 
          options
        );
        break;
      case "arrow":
        ShapeDrawingService.drawArrow(
          context,
          drawingState.startX,
          drawingState.startY,
          x,
          y,
          options
        );
        break;
    }
    
    setDrawingState(prev => ({
      ...prev,
      endX: x,
      endY: y
    }));
  };
  
  const finishShape = () => {
    setDrawingState(prev => ({
      ...prev,
      isDrawing: false
    }));
    imageDataRef.current = null;
  };

  return {
    drawingState,
    startShape,
    previewShape,
    finishShape
  };
};
