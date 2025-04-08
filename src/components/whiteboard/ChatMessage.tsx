
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

interface ChatMessageProps {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// Function to format message content
const formatMessage = (content: string) => {
  // Handle code blocks and URLs
  const parts = content.split(/```([\s\S]*?)```/);
  
  return parts.map((part, index) => {
    if (index % 2 === 0) {
      // Regular text - replace URLs with links
      const textWithLinks = part.replace(
        /(https?:\/\/[^\s]+)/g,
        '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-500 underline">$1</a>'
      );
      
      // Replace line breaks with <br> tags
      const textWithBreaks = textWithLinks.replace(/\n/g, '<br>');
      
      return (
        <span key={index} dangerouslySetInnerHTML={{ __html: textWithBreaks }} />
      );
    } else {
      // Code block
      return (
        <pre key={index} className="bg-gray-800 text-gray-100 p-3 rounded-md my-2 overflow-x-auto text-sm">
          <code>{part}</code>
        </pre>
      );
    }
  });
};

const ChatMessage: React.FC<ChatMessageProps> = ({ id, role, content, timestamp }) => {
  // Format the relative time (e.g., "5 minutes ago")
  const timeAgo = formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  
  return (
    <div className={`flex mb-4 ${role === "user" ? "justify-end" : "justify-start"}`}>
      {role === "assistant" && (
        <div className="mr-2 mt-1">
          <Avatar className="h-8 w-8 bg-teal-100 text-teal-600">
            <AvatarFallback>AI</AvatarFallback>
            <AvatarImage src="/ai-avatar.png" />
          </Avatar>
        </div>
      )}
      
      <div 
        className={`max-w-[80%] rounded-xl p-3 ${
          role === "user" 
            ? "bg-teal-500 text-white" 
            : "bg-gray-100 text-gray-800"
        }`}
      >
        <div className="prose prose-sm">
          {formatMessage(content)}
        </div>
        <div 
          className={`text-xs mt-1 text-right ${
            role === "user" ? "text-teal-100" : "text-gray-500"
          }`}
        >
          {timeAgo}
        </div>
      </div>
      
      {role === "user" && (
        <div className="ml-2 mt-1">
          <Avatar className="h-8 w-8 bg-teal-500 text-white">
            <AvatarFallback>U</AvatarFallback>
            <AvatarImage src="/user-avatar.png" />
          </Avatar>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
