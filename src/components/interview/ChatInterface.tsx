
import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  companyName: string;
  designLevel: "Junior" | "Senior" | "Lead";
  onSessionEnd: (feedback: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  companyName,
  designLevel,
  onSessionEnd,
}) => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const MAX_RETRIES = 2;

  // Initialize chat with first AI message
  useEffect(() => {
    initializeChat();
  }, [companyName, designLevel]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initializeChat = async () => {
    setIsInitializing(true);
    try {
      const response = await supabase.functions.invoke('interview-chat', {
        body: {
          action: "start",
          companyName: companyName,
          designLevel: designLevel
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
      toast.error("Failed to start the interview. Using a default prompt.");
      
      // Add a fallback first message if API fails
      const fallbackMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: `Hello! I'm a product design interviewer from ${companyName}. Today, I'll be evaluating your design skills for a ${designLevel} position. Let's start with a challenge: Design a feature that would improve user engagement for our core product. Could you walk me through your approach?`,
        timestamp: new Date()
      };
      
      setChatHistory([fallbackMessage]);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: newMessage,
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, userMessage]);
    setNewMessage("");
    setIsSending(true);
    setRetryCount(0);

    try {
      await sendMessageToAI(newMessage);
    } catch (error) {
      console.error("Error sending message:", error);
      handleRetryOrFallback();
    } finally {
      setIsSending(false);
    }
  };

  const sendMessageToAI = async (message: string) => {
    const response = await supabase.functions.invoke('interview-chat', {
      body: {
        action: "chat",
        message: message,
        history: chatHistory.map(msg => ({
          role: msg.role === "assistant" ? "assistant" : "user",
          content: msg.content
        })),
        companyName: companyName,
        designLevel: designLevel
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

    setChatHistory(prev => [...prev, aiMessage]);
  };

  const handleRetryOrFallback = async () => {
    if (retryCount < MAX_RETRIES) {
      toast.info(`Retrying... (${retryCount + 1}/${MAX_RETRIES})`);
      setRetryCount(prev => prev + 1);
      try {
        await sendMessageToAI(newMessage);
      } catch (error) {
        console.error("Retry failed:", error);
        if (retryCount + 1 >= MAX_RETRIES) {
          addFallbackResponse();
        } else {
          handleRetryOrFallback();
        }
      }
    } else {
      addFallbackResponse();
    }
  };

  const addFallbackResponse = () => {
    toast.error("Failed to get a response. Using a fallback response.");
    
    const fallbackResponse: ChatMessage = {
      id: `ai-${Date.now()}`,
      role: "assistant",
      content: "I'm having trouble processing your response right now. That's an interesting perspective though. Could you elaborate more on your design approach and how you would validate your solution with users?",
      timestamp: new Date()
    };
    
    setChatHistory(prev => [...prev, fallbackResponse]);
  };

  const handleEndSession = async () => {
    setIsSending(true);
    try {
      const response = await supabase.functions.invoke('interview-chat', {
        body: {
          action: "end",
          history: chatHistory.map(msg => ({
            role: msg.role === "assistant" ? "assistant" : "user",
            content: msg.content
          })),
          companyName: companyName,
          designLevel: designLevel
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const feedback = response.data.feedback || response.data.message;
      onSessionEnd(feedback);
    } catch (error) {
      console.error("Error ending session:", error);
      toast.error("Could not generate feedback. Using a default evaluation.");
      
      // Provide fallback evaluation
      const fallbackFeedback = `Thank you for participating in this design interview for ${companyName}. 

Based on our conversation, here's my evaluation:

Overall Score: 75/100

Strengths:
- You showed good communication skills
- You demonstrated knowledge of design principles
- You approached the problem with a user-centered mindset

Areas for Improvement:
- Consider incorporating more data-driven decision making
- Expand on how you would test and validate your solutions
- Delve deeper into edge cases and accessibility concerns

This is a simplified evaluation as we're currently experiencing technical difficulties. In a real interview setting, we would provide more specific feedback based on your answers.`;
      
      onSessionEnd(fallbackFeedback);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 mb-4">
        {isInitializing ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-pulse text-center">
              <p className="text-gray-500">Initializing interview...</p>
            </div>
          </div>
        ) : (
          chatHistory.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "assistant" ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === "assistant"
                    ? "bg-gray-100 text-gray-800"
                    : "bg-[rgba(97,228,197,1)] text-black"
                }`}
              >
                <p className="whitespace-pre-line">{message.content}</p>
                <div
                  className={`text-xs mt-2 ${
                    message.role === "assistant"
                      ? "text-gray-500"
                      : "text-gray-700"
                  }`}
                >
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex gap-2">
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

          <Button
            onClick={handleEndSession}
            disabled={isSending || isInitializing || chatHistory.length < 3}
            className="w-full bg-white text-black border border-black hover:bg-gray-100"
          >
            End Interview & Get Feedback
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
