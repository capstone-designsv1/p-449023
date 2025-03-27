
import React from "react";
import { Avatar } from "@/components/ui/avatar";

interface ChatMessageProps {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ id, role, content, timestamp }) => {
  const formatMessage = (content: string) => {
    return content.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  return (
    <div
      className={`flex mb-3 ${
        role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`flex max-w-[85%] ${
          role === "user" ? "flex-row-reverse" : "flex-row"
        }`}
      >
        <Avatar className="h-8 w-8 mx-1 flex-shrink-0">
          {role === "user" ? (
            <div className="bg-blue-500 h-full w-full flex items-center justify-center text-white">
              U
            </div>
          ) : (
            <div className="bg-[rgba(97,228,197,1)] h-full w-full flex items-center justify-center text-black">
              I
            </div>
          )}
        </Avatar>
        <div
          className={`rounded-lg p-2 text-sm ${
            role === "user"
              ? "bg-blue-500 text-white"
              : "bg-white border border-gray-200"
          }`}
        >
          <p className="whitespace-pre-line">{formatMessage(content)}</p>
          <span className="text-xs opacity-70 mt-1 block">
            {timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
