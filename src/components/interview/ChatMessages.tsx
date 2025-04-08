
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
  isSpeaking?: boolean;
  toggleSpeaking?: () => void;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ 
  messages, 
  messagesEndRef,
  isSpeaking,
  toggleSpeaking 
}) => {
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
              className={`flex items-center justify-between mt-2 ${
                message.role === "assistant"
                  ? "text-gray-500"
                  : "text-gray-700"
              }`}
            >
              <div className="text-xs">
                {message.timestamp.toLocaleTimeString()}
              </div>
              
              {/* Play Response button for assistant messages */}
              {message.role === "assistant" && toggleSpeaking && (
                <button
                  onClick={toggleSpeaking}
                  className={`text-xs flex items-center gap-1 ${
                    isSpeaking ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {isSpeaking ? "Stop" : "Play Response"}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
