
import { useState } from "react";
import { toast } from "sonner";

export interface ShapeType {
  id: string;
  type: "circle" | "square";
  position: { x: number; y: number };
  color: string;
  size: number;
}

export const useShapes = () => {
  const [shapes, setShapes] = useState<ShapeType[]>([]);

  const updateShapePosition = (id: string, position: { x: number; y: number }) => {
    setShapes(shapes.map(shape => 
      shape.id === id ? { ...shape, position } : shape
    ));
  };

  const deleteShape = (id: string) => {
    setShapes(shapes.filter(shape => shape.id !== id));
    toast.success("Shape removed");
  };

  return {
    shapes,
    setShapes,
    updateShapePosition,
    deleteShape
  };
};
