
import React from "react";
import StickyNote from "./StickyNote";

interface StickyNoteType {
  id: string;
  text: string;
  position: { x: number; y: number };
  color: string;
}

interface StickyNoteListProps {
  notes: StickyNoteType[];
  updateNotePosition: (id: string, position: { x: number; y: number }) => void;
  updateNoteText: (id: string, text: string) => void;
  deleteNote: (id: string) => void;
}

const StickyNoteList: React.FC<StickyNoteListProps> = ({
  notes,
  updateNotePosition,
  updateNoteText,
  deleteNote
}) => {
  return (
    <>
      {notes.map((note) => (
        <StickyNote
          key={note.id}
          id={note.id}
          text={note.text}
          position={note.position}
          color={note.color}
          updatePosition={updateNotePosition}
          updateText={updateNoteText}
          deleteNote={deleteNote}
        />
      ))}
    </>
  );
};

export default StickyNoteList;
