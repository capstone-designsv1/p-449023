
import { useChallengeContext } from "@/context/ChallengeContext";

interface Note {
  id: string;
  text: string;
  position: { x: number; y: number };
  color: string;
}

export const useNotes = () => {
  const { notes, setNotes } = useChallengeContext();

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
    // Removed toast notification for routine note deletion
  };

  return {
    notes,
    updateNotePosition,
    updateNoteText,
    deleteNote
  };
};
