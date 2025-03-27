
import React from "react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatMessagesProps {
  messages: ChatMessage[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, messagesEndRef }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 mb-4">
      {messages.map((message) => (
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
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
