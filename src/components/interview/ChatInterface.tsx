
import React, { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChatMessage {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  companyName: string;
  designLevel: "Junior" | "Senior" | "Lead";
  onSessionEnd?: (feedback: string) => void;
  industry?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  companyName,
  designLevel,
  onSessionEnd,
  industry,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<{
    message: string;
  }>();

  useEffect(() => {
    // Start the interview with an initial message from the AI
    startInterview();
  }, [companyName, designLevel, industry]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const startInterview = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/interview-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "start",
          companyName,
          designLevel,
          industry,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to start the interview");
      }

      const data = await response.json();
      
      setMessages([
        {
          id: `initial-${Date.now()}`,
          role: "assistant",
          content: data.message,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Error starting interview:", error);
      toast.error("Failed to start the interview. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (data: { message: string }) => {
    if (!data.message.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: data.message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    reset();
    setIsLoading(true);

    try {
      const response = await fetch("/api/interview-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "chat",
          message: data.message,
          history: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          companyName,
          designLevel,
          industry,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const responseData = await response.json();
      
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: responseData.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Check if this is the end of the session
      if (responseData.sessionEnded) {
        setSessionEnded(true);
        if (onSessionEnd) {
          onSessionEnd(responseData.feedback);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to get a response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndSession = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/interview-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "end",
          history: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          companyName,
          designLevel,
          industry,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to end session");
      }

      const responseData = await response.json();
      
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: responseData.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setSessionEnded(true);
      
      if (onSessionEnd) {
        onSessionEnd(responseData.feedback);
      }
    } catch (error) {
      console.error("Error ending session:", error);
      toast.error("Failed to end the session. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatMessage = (content: string) => {
    return content.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`flex max-w-[80%] ${
                message.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <Avatar className="h-10 w-10 mx-2">
                {message.role === "user" ? (
                  <div className="bg-blue-500 h-full w-full flex items-center justify-center text-white">
                    U
                  </div>
                ) : (
                  <div className="bg-[rgba(97,228,197,1)] h-full w-full flex items-center justify-center text-black">
                    {companyName[0]}
                  </div>
                )}
              </Avatar>
              <div
                className={`rounded-lg p-3 ${
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
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4 bg-white">
        {!sessionEnded ? (
          <form
            onSubmit={handleSubmit(sendMessage)}
            className="flex flex-col space-y-2"
          >
            <Textarea
              {...register("message")}
              placeholder="Type your response..."
              className="min-h-[80px] resize-none"
              disabled={isLoading || isSubmitting}
            />
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleEndSession}
                disabled={isLoading || isSubmitting || messages.length < 2}
              >
                End Interview
              </Button>
              <Button
                type="submit"
                className="bg-[rgba(97,228,197,1)] text-black border border-black hover:bg-[rgba(77,208,177,1)]"
                disabled={isLoading || isSubmitting}
              >
                {isLoading ? "Thinking..." : "Send"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center p-4">
            <p className="text-gray-700 mb-2">Interview session has ended</p>
            <p className="text-sm text-gray-500">Check the feedback section for your performance review</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
