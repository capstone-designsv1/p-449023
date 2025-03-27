
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface WhiteboardCanvasProps {
  activeTool: "pen" | "eraser" | "select" | "text";
}

const WhiteboardCanvas: React.FC<WhiteboardCanvasProps> = ({ activeTool }) => {
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
    
    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  // Handle tool changes
  useEffect(() => {
    if (!context) return;
    
    if (activeTool === "pen") {
      context.strokeStyle = "#000000";
      context.lineWidth = 2;
    } else if (activeTool === "eraser") {
      context.strokeStyle = "#ffffff";
      context.lineWidth = 20;
    }
  }, [activeTool, context]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool !== "pen" && activeTool !== "eraser") return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    context?.beginPath();
    context?.moveTo(x, y);
    
    setIsDrawing(true);
    setLastPosition({ x, y });
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context || (activeTool !== "pen" && activeTool !== "eraser")) return;
    
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
