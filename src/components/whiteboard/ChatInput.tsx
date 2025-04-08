
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSpeechToText } from "@/hooks/useSpeechToText";

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
  setInputText,
  isVoiceMode,
  toggleVoiceMode
}) => {
  const [newMessage, setNewMessage] = useState("");
  
  // Initialize speech-to-text functionality
  const { isListening, startListening, stopListening } = useSpeechToText({
    onTranscriptReady: (text) => {
      setNewMessage(prev => prev + " " + text);
      if (setInputText) {
        setInputText(prev => prev + " " + text);
      }
    }
  });
  
  // Toggle listening functionality
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };
  
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
      <div className="flex flex-col gap-2 self-end">
        {toggleVoiceMode && (
          <Button
            onClick={toggleVoiceMode}
            size="icon"
            variant="outline"
            className={cn(
              "transition-colors",
              isVoiceMode && "bg-green-100 text-green-700 border-green-300"
            )}
            title={isVoiceMode ? "Disable voice mode" : "Enable voice mode"}
          >
            <Mic className="h-4 w-4" />
          </Button>
        )}
        
        {/* New microphone toggle button */}
        <Button
          onClick={toggleListening}
          size="icon"
          variant="outline"
          className={cn(
            "transition-colors",
            isListening && "bg-red-100 text-red-700 border-red-300"
          )}
          title={isListening ? "Stop listening" : "Start listening"}
          disabled={isSending}
        >
          {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
        
        <Button
          onClick={handleSend}
          size="icon"
          disabled={isSending || !newMessage.trim()}
          className="bg-[rgba(97,228,197,1)] text-black border border-black hover:bg-[rgba(77,208,177,1)]"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;
