
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface StickyNoteType {
  id: string;
  text: string;
  position: { x: number; y: number };
  color: string;
}

interface WhiteboardSidebarProps {
  description: string;
  notes: StickyNoteType[];
  setNotes: React.Dispatch<React.SetStateAction<StickyNoteType[]>>;
  onSubmitForEvaluation: (data: { finalAnswer: string }) => void;
  isEvaluating: boolean;
}

interface EvaluationFormValues {
  finalAnswer: string;
}

const WhiteboardSidebar: React.FC<WhiteboardSidebarProps> = ({
  description,
  notes,
  setNotes,
  onSubmitForEvaluation,
  isEvaluating,
}) => {
  const [newNoteText, setNewNoteText] = useState("");
  
  const form = useForm<EvaluationFormValues>({
    defaultValues: {
      finalAnswer: ""
    }
  });

  const addStickyNote = () => {
    if (!newNoteText.trim()) return;
    
    const colors = ["#FEF7CD", "#FEC6A1", "#E5DEFF", "#FFDEE2", "#D3E4FD"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    // Place new notes in the sidebar
    const newNote = {
      id: `note-${Date.now()}`,
      text: newNoteText,
      position: { 
        x: 20, 
        y: 30 + notes.length * 20
      },
      color: randomColor
    };
    
    setNotes([...notes, newNote]);
    setNewNoteText("");
    toast.success("Sticky note added!");
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
    toast.success("Sticky note removed");
  };

  return (
    <div className="w-80 border-r border-gray-200 bg-white p-4 flex flex-col h-[calc(100vh-70px)] overflow-y-auto">
      {/* Challenge Brief Section */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Challenge Brief</h2>
        <p className="text-gray-700 mb-4">{description}</p>
      </div>
      
      {/* Final Answer Section - Moved up */}
      <div className="mb-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmitForEvaluation)} className="space-y-4">
            <FormField
              control={form.control}
              name="finalAnswer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-md font-semibold">Final Answer</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter your final solution or design rationale here..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button 
              type="submit"
              className="w-full bg-[rgba(97,228,197,1)] text-black border border-black hover:bg-[rgba(77,208,177,1)]"
              disabled={isEvaluating}
            >
              {isEvaluating ? "Evaluating..." : "Submit for Evaluation"}
            </Button>
          </form>
        </Form>
      </div>
      
      {/* Sticky Notes Section */}
      <div className="mb-6">
        <h3 className="text-md font-semibold mb-2">Your Notes</h3>
        <Textarea
          value={newNoteText}
          onChange={(e) => setNewNoteText(e.target.value)}
          placeholder="Type your note here..."
          className="min-h-[80px] mb-3"
        />
        <Button 
          onClick={addStickyNote}
          className="w-full bg-gray-100 text-black border border-gray-300 hover:bg-gray-200 mb-4"
        >
          Add Note
        </Button>
        
        {/* Display Notes */}
        <div className="space-y-3 max-h-[200px] overflow-y-auto">
          {notes.map((note) => (
            <div 
              key={note.id} 
              className="p-3 rounded shadow-sm relative"
              style={{ backgroundColor: note.color }}
            >
              <button
                className="absolute top-1 right-1 p-1 rounded-full hover:bg-gray-200/50 text-gray-600"
                onClick={() => deleteNote(note.id)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
              <p className="pr-5">{note.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WhiteboardSidebar;
