
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isSending: boolean;
  inputText?: string;
  setInputText?: (text: string) => void;
  isVoiceMode?: boolean;
  toggleVoiceMode?: () => void;
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
    <div className="flex items-end gap-2 px-6 py-4 border-t border-gray-200">
      <Textarea
        value={newMessage}
        onChange={handleChange}
        placeholder="Type message..."
        className="min-h-[48px] max-h-24 resize-none flex-1 rounded-xl border-gray-300 focus:border-green-500 focus:ring focus:ring-green-200"
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
        disabled={isSending || !newMessage.trim()}
        className="bg-green-500 hover:bg-green-600 text-white rounded-full h-12 w-12 flex items-center justify-center"
      >
        <Send className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default ChatInput;
