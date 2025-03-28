
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface WhiteboardCanvasProps {
  activeTool: "eraser" | "select" | "text" | "arrow" | "circle" | "square";
  onCanvasRef?: (ref: HTMLCanvasElement | null) => void;
}

const WhiteboardCanvas: React.FC<WhiteboardCanvasProps> = ({ activeTool, onCanvasRef }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });

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
    
    if (activeTool === "eraser") {
      context.strokeStyle = "#ffffff";
      context.lineWidth = 20;
    }
  }, [activeTool, context]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool !== "eraser") return;
    
    // If double click with eraser tool, clear the entire canvas
    if (e.detail === 2 && activeTool === "eraser") {
      clearCanvas();
      return;
    }
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    context?.beginPath();
    context?.moveTo(x, y);
    
    setIsDrawing(true);
    setLastPosition({ x, y });
  };

  const clearCanvas = () => {
    if (!canvasRef.current || !context) return;
    
    const canvas = canvasRef.current;
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    toast.success("Canvas cleared");
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context || activeTool !== "eraser") return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    context.lineTo(x, y);
    context.stroke();
    
    setLastPosition({ x, y });
  };

  const stopDrawing = () => {
    if (isDrawing) {
      context?.closePath();
      setIsDrawing(false);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 cursor-crosshair"
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
    />
  );
};

export default WhiteboardCanvas;
