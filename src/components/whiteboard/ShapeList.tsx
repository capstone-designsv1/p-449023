
import React from "react";
import Shape from "./Shape";

interface ShapeType {
  id: string;
  type: "circle" | "square";
  position: { x: number; y: number };
  color: string;
  size: number;
}

interface ShapeListProps {
  shapes: ShapeType[];
  updateShapePosition: (id: string, position: { x: number; y: number }) => void;
  deleteShape: (id: string) => void;
}

const ShapeList: React.FC<ShapeListProps> = ({ shapes, updateShapePosition, deleteShape }) => {
  return (
    <>
      {shapes.map((shape) => (
        <Shape
          key={shape.id}
          id={shape.id}
          type={shape.type}
          position={shape.position}
          color={shape.color}
          size={shape.size}
          updatePosition={updateShapePosition}
          deleteShape={deleteShape}
        />
      ))}
    </>
  );
};

export default ShapeList;
