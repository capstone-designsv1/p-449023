
import { useState } from "react";

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
    // Removed toast notification for routine shape deletion
  };

  return {
    shapes,
    setShapes,
    updateShapePosition,
    deleteShape
  };
};
