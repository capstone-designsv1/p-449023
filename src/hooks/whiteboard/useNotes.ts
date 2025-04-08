
import { useChallengeContext } from "@/context/ChallengeContext";
import { toast } from "sonner";

interface Note {
  id: string;
  text: string;
  position: { x: number; y: number };
  color: string;
}

// Available colors for sticky notes
const NOTE_COLORS = [
  "#FFDEE2", // Soft Pink
  "#E5DEFF", // Soft Purple
  "#FDE1D3", // Soft Peach
  "#D3E4FD", // Soft Blue
  "#F1F0FB", // Soft Gray
];

export const useNotes = () => {
  const { notes, setNotes } = useChallengeContext();

  const addNote = (position: { x: number; y: number }) => {
    // Generate a random color
    const randomColor = NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)];
    
    const newNote = {
      id: `note-${Date.now()}`,
      text: "Type your note here...",
      position,
      color: randomColor,
    };
    
    setNotes([...notes, newNote]);
  };

  const updateNotePosition = (id: string, position: { x: number; y: number }) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, position } : note
    ));
  };

  const updateNoteText = (id: string, text: string) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, text } : note
    ));
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
    toast.success("Sticky note removed");
  };

  return {
    notes,
    addNote,
    updateNotePosition,
    updateNoteText,
    deleteNote
  };
};
