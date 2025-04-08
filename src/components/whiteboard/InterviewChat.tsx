
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import ChatMessage from "./ChatMessage";
import { useVoiceControl } from "@/hooks/useVoiceControl";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface InterviewChatProps {
  chatHistory: ChatMessage[];
  isSending: boolean;
  onSendMessage: (message: string) => void;
  onSubmitForEvaluation: (data: any) => void;
  isEvaluating: boolean;
}

const InterviewChat: React.FC<InterviewChatProps> = ({
  chatHistory,
  isSending,
  onSendMessage,
  onSubmitForEvaluation,
  isEvaluating
}) => {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice control integration
  const {
    isVoiceMode,
    isListening,
    isSpeaking,
    inputText,
    setInputText,
    toggleVoiceMode,
    toggleListening,
    toggleSpeaking,
  } = useVoiceControl({
    chatHistory,
    sendMessage: onSendMessage
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (message.trim() && !isSending) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col">
      <h2 className="text-xl font-semibold mb-4">Interview Partner</h2>
      
      {/* Chat messages */}
      <div className="rounded-lg mb-4 overflow-y-auto max-h-[400px] bg-gray-50 p-4">
        {chatHistory.length === 0 ? (
          <p className="text-gray-400 text-center py-4">Start the conversation...</p>
        ) : (
          chatHistory.map((msg) => (
            <ChatMessage
              key={msg.id}
              id={msg.id}
              role={msg.role}
              content={msg.content}
              timestamp={msg.timestamp}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message input */}
      <div className="mb-4">
        <div className="flex gap-2">
          <textarea
            value={inputText || message}
            onChange={(e) => {
              setMessage(e.target.value);
              if (setInputText) {
                setInputText(e.target.value);
              }
            }}
            placeholder="Type message..."
            className="flex-1 rounded-md border border-gray-300 p-2 min-h-[60px] text-sm"
            onKeyDown={handleKeyDown}
            disabled={isSending}
          />
          <Button
            onClick={handleSendMessage}
            size="icon"
            disabled={isSending || !message.trim()}
            className="bg-[rgba(97,228,197,1)] text-black border border-black hover:bg-[rgba(77,208,177,1)]"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Submit button */}
      <Button 
        onClick={() => onSubmitForEvaluation({ chatHistory })}
        className="w-full bg-[rgba(97,228,197,1)] text-black border border-black hover:bg-[rgba(77,208,177,1)]"
        disabled={isEvaluating || chatHistory.length <= 1}
      >
        {isEvaluating ? "Evaluating..." : "Submit for Evaluation"}
      </Button>
    </div>
  );
};

export default InterviewChat;
