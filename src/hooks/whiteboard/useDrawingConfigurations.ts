
import { useState } from "react";
import { WhiteboardTool } from "./useWhiteboardTools";

interface ToolConfiguration {
  strokeWidth: number;
  strokeColor: string;
  fillColor?: string;
}

export const useDrawingConfigurations = () => {
  // Default configurations for each tool
  const defaultConfigurations: Record<WhiteboardTool, ToolConfiguration> = {
    select: { strokeWidth: 1, strokeColor: "#000000" },
    eraser: { strokeWidth: 20, strokeColor: "#ffffff" },
    text: { strokeWidth: 1, strokeColor: "#000000" },
    arrow: { strokeWidth: 2, strokeColor: "#000000" },
    circle: { strokeWidth: 2, strokeColor: "#000000", fillColor: "rgba(0,0,0,0.1)" },
    square: { strokeWidth: 2, strokeColor: "#000000", fillColor: "rgba(0,0,0,0.1)" }
  };
  
  const [toolConfigurations, setToolConfigurations] = useState<Record<WhiteboardTool, ToolConfiguration>>(defaultConfigurations);
  
  const updateToolConfiguration = (
    tool: WhiteboardTool, 
    config: Partial<ToolConfiguration>
  ) => {
    setToolConfigurations(prev => ({
      ...prev,
      [tool]: {
        ...prev[tool],
        ...config
      }
    }));
  };
  
  const getToolConfiguration = (tool: WhiteboardTool): ToolConfiguration => {
    return toolConfigurations[tool];
  };
  
  return {
    toolConfigurations,
    updateToolConfiguration,
    getToolConfiguration
  };
};
