
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import ChatMessage from "./ChatMessage";
import { useChallengeContext } from "@/context/ChallengeContext";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  onSubmitForEvaluation: (data: { chatHistory?: ChatMessage[] }) => void;
  isEvaluating: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  onSubmitForEvaluation,
  isEvaluating
}) => {
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { chatHistory, setChatHistory, activeChallenge } = useChallengeContext();

  // Scroll to bottom of chat when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Initialize chat with the first AI message when component mounts
  useEffect(() => {
    if (chatHistory.length === 0 && activeChallenge) {
      initializeChat();
    }
  }, [activeChallenge, chatHistory.length]);

  const initializeChat = async () => {
    if (!activeChallenge) return;
    
    try {
      const companyName = activeChallenge.company;
      console.log("Initializing chat with company:", companyName);
      
      const response = await supabase.functions.invoke('interview-chat', {
        body: {
          action: "start",
          companyName: companyName,
          designLevel: "Senior" // This should ideally be configurable
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: response.data.message,
        timestamp: new Date()
      };

      setChatHistory([aiMessage]);
    } catch (error) {
      console.error("Error initializing chat:", error);
      toast.error("Failed to start the interview. Please try again.");
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending || !activeChallenge) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: newMessage,
      timestamp: new Date()
    };

    setChatHistory((prev) => [...prev, userMessage]);
    setNewMessage("");
    setIsSending(true);

    try {
      const companyName = activeChallenge.company;
      console.log("Sending message with company:", companyName);
      
      const response = await supabase.functions.invoke('interview-chat', {
        body: {
          action: "chat",
          message: newMessage,
          history: chatHistory.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          companyName: companyName,
          designLevel: "Senior" // This should ideally be configurable
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: response.data.message,
        timestamp: new Date()
      };

      setChatHistory((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to get a response. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmitEvaluation = async () => {
    if (chatHistory.length <= 1) {
      toast.error("Please have a conversation before submitting for evaluation");
      return;
    }
    
    onSubmitForEvaluation({ chatHistory: chatHistory });
  };

  return (
    <div className="flex-1 flex flex-col mb-4">
      <h2 className="text-lg font-semibold mb-2">Interview Partner</h2>
      
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50 rounded-md p-3 mb-3 min-h-[200px] max-h-[300px]">
        {chatHistory.length === 0 ? (
          <div className="text-gray-400 text-center py-4">
            Starting interview conversation...
          </div>
        ) : (
          chatHistory.map((message) => (
            <ChatMessage 
              key={message.id}
              id={message.id}
              role={message.role}
              content={message.content}
              timestamp={message.timestamp}
            />
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
          disabled={isSending}
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
          disabled={isSending}
          className="self-end bg-[rgba(97,228,197,1)] text-black border border-black hover:bg-[rgba(77,208,177,1)]"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Submit for Evaluation Button */}
      <Button 
        onClick={handleSubmitEvaluation}
        className="w-full mt-3 bg-[rgba(97,228,197,1)] text-black border border-black hover:bg-[rgba(77,208,177,1)]"
        disabled={isEvaluating || chatHistory.length <= 1}
      >
        {isEvaluating ? "Evaluating..." : "Submit for Evaluation"}
      </Button>
    </div>
  );
};

export default ChatInterface;
