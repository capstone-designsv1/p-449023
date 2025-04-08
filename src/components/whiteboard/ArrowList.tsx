
import React from "react";
import Arrow from "./Arrow";

interface ArrowType {
  id: string;
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  color: string;
  startElementId?: string;
  endElementId?: string;
}

interface ArrowListProps {
  arrows: ArrowType[];
  updateArrow: (id: string, startPoint: { x: number; y: number }, endPoint: { x: number; y: number }) => void;
  deleteArrow: (id: string) => void;
}

const ArrowList: React.FC<ArrowListProps> = ({ arrows, updateArrow, deleteArrow }) => {
  return (
    <>
      {arrows.map((arrow) => (
        <Arrow
          key={arrow.id}
          id={arrow.id}
          startPoint={arrow.startPoint}
          endPoint={arrow.endPoint}
          color={arrow.color}
          updateArrow={updateArrow}
          deleteArrow={deleteArrow}
        />
      ))}
    </>
  );
};

export default ArrowList;
