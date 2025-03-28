
import { useRef } from "react";

export const useCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleCanvasRef = (ref: HTMLCanvasElement | null) => {
    canvasRef.current = ref;
  };

  const getCanvasData = (): string => {
    if (!canvasRef.current) return "";
    return canvasRef.current.toDataURL();
  };

  return {
    canvasRef,
    handleCanvasRef,
    getCanvasData
  };
};
