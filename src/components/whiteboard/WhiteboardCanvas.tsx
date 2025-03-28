
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useDrawingTools, DrawingPoint } from "@/hooks/whiteboard/useDrawingTools";
import { useCanvasDrawing } from "@/hooks/whiteboard/useCanvasDrawing";
import { useDrawingConfigurations } from "@/hooks/whiteboard/useDrawingConfigurations";
import { WhiteboardTool } from "@/hooks/whiteboard/useWhiteboardTools";

interface WhiteboardCanvasProps {
  activeTool: WhiteboardTool;
  onCanvasRef?: (ref: HTMLCanvasElement | null) => void;
}

const WhiteboardCanvas: React.FC<WhiteboardCanvasProps> = ({ activeTool, onCanvasRef }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const { toolConfigurations, getToolConfiguration } = useDrawingConfigurations();
  const { isDrawing, startDrawing, draw, stopDrawing, clearCanvas } = useDrawingTools(context);
  const { startShape, previewShape, finishShape, drawingState } = useCanvasDrawing(context);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    if (!ctx) return;
    
    // Set canvas to fill its container
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    
    // Initialize canvas with white background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Set default pen style
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    
    setContext(ctx);
    
    // Expose canvas ref to parent component if callback provided
    if (onCanvasRef) {
      onCanvasRef(canvas);
    }
    
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (onCanvasRef) {
        onCanvasRef(null);
      }
    };
  }, [onCanvasRef]);

  // Handle tool changes
  useEffect(() => {
    if (!context) return;
    
    const config = getToolConfiguration(activeTool);
    context.strokeStyle = config.strokeColor;
    context.lineWidth = config.strokeWidth;
    
  }, [activeTool, context, getToolConfiguration]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // If double click with eraser tool, clear the entire canvas
    if (e.detail === 2 && activeTool === "eraser") {
      clearCanvas(canvasRef.current);
      return;
    }
    
    switch (activeTool) {
      case "eraser":
        startDrawing(e, canvasRef.current, activeTool);
        break;
      case "circle":
      case "square":
      case "arrow":
        startShape(x, y, canvasRef.current);
        break;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (activeTool === "eraser") {
      draw(e, canvasRef.current, activeTool);
    } else if (["circle", "square", "arrow"].includes(activeTool) && drawingState.isDrawing) {
      previewShape(x, y, activeTool, canvasRef.current);
    }
  };

  const handleMouseUp = () => {
    if (activeTool === "eraser") {
      stopDrawing();
    } else if (["circle", "square", "arrow"].includes(activeTool)) {
      finishShape();
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 cursor-crosshair"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  );
};

export default WhiteboardCanvas;
