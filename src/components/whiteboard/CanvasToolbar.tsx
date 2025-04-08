
import React from "react";
import { Button } from "@/components/ui/button";

interface CanvasToolbarProps {
  activeTool: string;
  setActiveTool: (tool: any) => void;
}

const CanvasToolbar: React.FC<CanvasToolbarProps> = ({ activeTool, setActiveTool }) => {
  const tools = [
    { id: "arrow", icon: "⟲", label: "Arrow" },
    { id: "square", icon: "□", label: "Square" },
    { id: "circle", icon: "○", label: "Circle" },
    { id: "line", icon: "┌┐", label: "Line" },
    { id: "note", icon: "📝", label: "Note" },
    { id: "text", icon: "T", label: "Text" }
  ];

  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-lg px-6 py-3 flex items-center gap-6">
      {tools.map((tool) => (
        <Button
          key={tool.id}
          variant="ghost"
          className={`h-10 w-10 rounded-full flex items-center justify-center text-lg ${
            activeTool === tool.id ? "bg-gray-100" : ""
          }`}
          onClick={() => setActiveTool(tool.id)}
          title={tool.label}
        >
          {tool.icon}
        </Button>
      ))}
    </div>
  );
};

export default CanvasToolbar;
