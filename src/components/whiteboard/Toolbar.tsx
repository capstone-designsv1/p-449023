
import React from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Eraser, MousePointer, Type } from "lucide-react";

interface ToolbarProps {
  activeTool: "pen" | "eraser" | "select" | "text";
  setActiveTool: (tool: "pen" | "eraser" | "select" | "text") => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ activeTool, setActiveTool }) => {
  return (
    <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 bg-white rounded-lg shadow-md p-2 border border-gray-200">
      <Button
        variant="ghost"
        size="icon"
        className={`rounded-md ${activeTool === "pen" ? "bg-gray-200" : ""}`}
        onClick={() => setActiveTool("pen")}
        title="Pen"
      >
        <Pencil size={20} />
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
        className={`rounded-md ${activeTool === "select" ? "bg-gray-200" : ""}`}
        onClick={() => setActiveTool("select")}
        title="Select"
      >
        <MousePointer size={20} />
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
