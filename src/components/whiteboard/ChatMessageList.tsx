
import React from "react";
import ChatMessage from "./ChatMessage";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatMessageListProps {
  messages: Message[];
  isSpeaking?: boolean;
  toggleSpeaking?: () => void;
}

const ChatMessageList: React.FC<ChatMessageListProps> = ({ 
  messages, 
  isSpeaking, 
  toggleSpeaking 
}) => {
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
    <div className="flex-1 overflow-y-auto p-4 space-y-4 mb-4">
      {messages.map((message) => (
        <ChatMessage 
          key={message.id} 
          {...message} 
          isSpeaking={isSpeaking}
          toggleSpeaking={toggleSpeaking}
        />
      ))}
    </div>
  );
};

export default ChatMessageList;
