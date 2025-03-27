
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface InterviewChatInputProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  handleSendMessage: () => void;
  isSending: boolean;
  isInitializing: boolean;
}

const InterviewChatInput: React.FC<InterviewChatInputProps> = ({
  newMessage,
  setNewMessage,
  handleSendMessage,
  isSending,
  isInitializing
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
      <Button
        onClick={handleSendMessage}
        size="icon"
        disabled={isSending || isInitializing || !newMessage.trim()}
        className="self-end bg-[rgba(97,228,197,1)] text-black border border-black hover:bg-[rgba(77,208,177,1)]"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default InterviewChatInput;
