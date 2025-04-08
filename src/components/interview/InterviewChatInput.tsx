
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface InterviewChatInputProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  handleSendMessage: () => void;
  isSending: boolean;
  isInitializing: boolean;
  isListening?: boolean;
  toggleListening?: () => void;
  isVoiceMode?: boolean;
}

const InterviewChatInput: React.FC<InterviewChatInputProps> = ({
  newMessage,
  setNewMessage,
  handleSendMessage,
  isSending,
  isInitializing,
  isListening,
  toggleListening,
  isVoiceMode
}) => {
  return (
    <div className="flex items-center gap-2">
      <Textarea
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type your message..."
        className="min-h-[60px] resize-none flex-1"
        disabled={isSending || isInitializing}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
          }
        }}
      />
      
      <div className="flex flex-col gap-2 self-end">
        {isVoiceMode && toggleListening && (
          <Button
            onClick={toggleListening}
            size="icon"
            variant="outline"
            className={cn(
              "transition-colors",
              isListening && "bg-red-100 text-red-700 border-red-300 animate-pulse"
            )}
            title={isListening ? "Stop listening" : "Start listening"}
            disabled={isSending || isInitializing}
          >
            {isListening ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
        )}
        
        <Button
          onClick={handleSendMessage}
          size="icon"
          disabled={isSending || isInitializing || !newMessage.trim()}
          className="self-end bg-[rgba(97,228,197,1)] text-black border border-black hover:bg-[rgba(77,208,177,1)]"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default InterviewChatInput;
