
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isSending: boolean;
  inputText?: string;
  setInputText?: (text: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  isSending,
  inputText,
  setInputText
}) => {
  const [newMessage, setNewMessage] = useState("");
  
  // Sync internal state with external inputText if provided
  useEffect(() => {
    if (inputText !== undefined) {
      setNewMessage(inputText);
    }
  }, [inputText]);

  const handleSend = () => {
    if (!newMessage.trim() || isSending) return;
    onSendMessage(newMessage);
    setNewMessage("");
    if (setInputText) {
      setInputText("");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    if (setInputText) {
      setInputText(e.target.value);
    }
  };

  return (
    <div className="flex gap-2">
      <Textarea
        value={newMessage}
        onChange={handleChange}
        placeholder="Type your message..."
        className="min-h-[60px] resize-none flex-1"
        disabled={isSending}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
      />
      <Button
        onClick={handleSend}
        size="icon"
        disabled={isSending}
        className="self-end bg-[rgba(97,228,197,1)] text-black border border-black hover:bg-[rgba(77,208,177,1)]"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ChatInput;
