
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { Send } from "lucide-react";

interface StickyNoteType {
  id: string;
  text: string;
  position: { x: number; y: number };
  color: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface WhiteboardSidebarProps {
  description: string;
  notes: StickyNoteType[];
  setNotes: React.Dispatch<React.SetStateAction<StickyNoteType[]>>;
  onSubmitForEvaluation: (data: { finalAnswer?: string, chatHistory?: ChatMessage[] }) => void;
  isEvaluating: boolean;
}

const WhiteboardSidebar: React.FC<WhiteboardSidebarProps> = ({
  description,
  notes,
  setNotes,
  onSubmitForEvaluation,
  isEvaluating,
}) => {
  const [newNoteText, setNewNoteText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const form = useForm({
    defaultValues: {
      finalAnswer: ""
    }
  });

  // Scroll to bottom of chat when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: newMessage,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: "I'm your interview partner. Let's discuss your approach to this design challenge. What's your initial thinking?",
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  const formatMessage = (content: string) => {
    return content.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  const handleSubmitEvaluation = () => {
    if (messages.length === 0) {
      toast.error("Please have a conversation before submitting for evaluation");
      return;
    }
    
    onSubmitForEvaluation({ chatHistory: messages });
  };

  return (
    <div className="w-80 border-r border-gray-200 bg-white p-4 flex flex-col h-[calc(100vh-70px)] overflow-y-auto">
      {/* Challenge Brief Section */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Challenge Brief</h2>
        <p className="text-gray-700">{description}</p>
      </div>
      
      {/* Interview Partner Section */}
      <div className="flex-1 flex flex-col mb-4">
        <h2 className="text-lg font-semibold mb-2">Interview Partner</h2>
        
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto bg-gray-50 rounded-md p-3 mb-3 min-h-[200px] max-h-[300px]">
          {messages.length === 0 ? (
            <div className="text-gray-400 text-center py-4">
              Start chatting with your interview partner about the challenge
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex mb-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex max-w-[85%] ${
                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <Avatar className="h-8 w-8 mx-1 flex-shrink-0">
                    {message.role === "user" ? (
                      <div className="bg-blue-500 h-full w-full flex items-center justify-center text-white">
                        U
                      </div>
                    ) : (
                      <div className="bg-[rgba(97,228,197,1)] h-full w-full flex items-center justify-center text-black">
                        A
                      </div>
                    )}
                  </Avatar>
                  <div
                    className={`rounded-lg p-2 text-sm ${
                      message.role === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-white border border-gray-200"
                    }`}
                  >
                    <p className="whitespace-pre-line">{formatMessage(message.content)}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Message Input */}
        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="min-h-[60px] resize-none flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            onClick={handleSendMessage}
            size="icon"
            className="self-end bg-[rgba(97,228,197,1)] text-black border border-black hover:bg-[rgba(77,208,177,1)]"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Submit for Evaluation Button */}
        <Button 
          onClick={handleSubmitEvaluation}
          className="w-full mt-3 bg-[rgba(97,228,197,1)] text-black border border-black hover:bg-[rgba(77,208,177,1)]"
          disabled={isEvaluating || messages.length === 0}
        >
          {isEvaluating ? "Evaluating..." : "Submit for Evaluation"}
        </Button>
      </div>
      
      {/* Sticky Notes Section */}
      <div>
        <h3 className="text-md font-semibold mb-2">Your Notes</h3>
        <Textarea
          value={newNoteText}
          onChange={(e) => setNewNoteText(e.target.value)}
          placeholder="Type your note here..."
          className="min-h-[80px] mb-3"
        />
        <Button 
          onClick={addStickyNote}
          className="w-full bg-[rgba(97,228,197,1)] text-black border border-black hover:bg-[rgba(77,208,177,1)] mb-4"
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
