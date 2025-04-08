
import { useState } from "react";

export type WhiteboardTool = "eraser" | "select" | "text" | "arrow" | "circle" | "square" | "note";

export const useWhiteboardTools = () => {
  const [activeTool, setActiveTool] = useState<WhiteboardTool>("select");

  return {
    activeTool,
    setActiveTool
  };
};
