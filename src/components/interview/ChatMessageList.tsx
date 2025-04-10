
import React from "react";
import { ChatMessage } from "@/services/interview";
import ChatMessages from "./ChatMessages";

interface ChatMessageListProps {
  messages: ChatMessage[];
  isSpeaking?: boolean;
  toggleSpeaking?: () => void;
}

const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  isSpeaking,
  toggleSpeaking
}) => {
  // Create a reference to scroll to the bottom when new messages arrive
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 p-4 flex items-center justify-center">
        <p className="text-gray-500 text-center">
          No messages yet. Start the conversation!
        </p>
      </div>
    );
  }

  return (
    <ChatMessages 
      messages={messages} 
      messagesEndRef={messagesEndRef}
      isSpeaking={isSpeaking}
      toggleSpeaking={toggleSpeaking}
    />
  );
};

export default ChatMessageList;
