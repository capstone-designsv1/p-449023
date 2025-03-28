
import React from "react";
import { Button } from "@/components/ui/button";
import { Eraser, MousePointer, Type, ArrowRight, Circle, Square } from "lucide-react";

interface ToolbarProps {
  activeTool: "eraser" | "select" | "text" | "arrow" | "circle" | "square";
  setActiveTool: (tool: "eraser" | "select" | "text" | "arrow" | "circle" | "square") => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ activeTool, setActiveTool }) => {
  return (
    <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 bg-white rounded-lg shadow-md p-2 border border-gray-200">
      <Button
        variant="ghost"
        size="icon"
        className={`rounded-md ${activeTool === "select" ? "bg-gray-200" : ""}`}
        onClick={() => setActiveTool("select")}
        title="Select"
      >
        <MousePointer size={20} />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className={`rounded-md ${activeTool === "eraser" ? "bg-gray-200" : ""}`}
        onClick={() => setActiveTool("eraser")}
        title="Eraser"
      >
        <Eraser size={20} />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className={`rounded-md ${activeTool === "arrow" ? "bg-gray-200" : ""}`}
        onClick={() => setActiveTool("arrow")}
        title="Connect with Arrow"
      >
        <ArrowRight size={20} />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className={`rounded-md ${activeTool === "circle" ? "bg-gray-200" : ""}`}
        onClick={() => setActiveTool("circle")}
        title="Circle"
      >
        <Circle size={20} />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className={`rounded-md ${activeTool === "square" ? "bg-gray-200" : ""}`}
        onClick={() => setActiveTool("square")}
        title="Square"
      >
        <Square size={20} />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className={`rounded-md ${activeTool === "text" ? "bg-gray-200" : ""}`}
        onClick={() => setActiveTool("text")}
        title="Text"
      >
        <Type size={20} />
      </Button>
    </div>
  );
};

export default Toolbar;
