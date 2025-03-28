
import { useState } from "react";
import { toast } from "sonner";

export interface ArrowType {
  id: string;
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  color: string;
  startElementId?: string;
  endElementId?: string;
}

export const useArrows = () => {
  const [arrows, setArrows] = useState<ArrowType[]>([]);

  const addArrow = (startPoint: { x: number; y: number }, endPoint: { x: number; y: number }) => {
    const newArrow: ArrowType = {
      id: `arrow-${Date.now()}`,
      startPoint,
      endPoint,
      color: "#000000",
    };
    setArrows([...arrows, newArrow]);
  };

  const updateArrow = (id: string, startPoint: { x: number; y: number }, endPoint: { x: number; y: number }) => {
    setArrows(arrows.map(arrow => 
      arrow.id === id ? { ...arrow, startPoint, endPoint } : arrow
    ));
  };

  const deleteArrow = (id: string) => {
    setArrows(arrows.filter(arrow => arrow.id !== id));
    toast.success("Arrow removed");
  };

  return {
    arrows,
    addArrow,
    updateArrow,
    deleteArrow
  };
};
