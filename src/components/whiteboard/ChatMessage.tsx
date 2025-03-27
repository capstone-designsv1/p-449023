
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

interface ChatMessageProps {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// Function to format message with code blocks, links, etc.
const formatMessage = (content: string) => {
  // Split content by code blocks
  const parts = content.split(/```([\s\S]*?)```/);
  
  return parts.map((part, index) => {
    if (index % 2 === 0) {
      // This is regular text (not inside code blocks)
      // Replace URLs with clickable links
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
      // This is a code block
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
    <div 
      className={`flex items-start gap-3 mb-4 ${
        role === "assistant" ? "" : "flex-row-reverse"
      }`}
    >
      {/* Avatar */}
      <Avatar className={`h-8 w-8 ${role === "assistant" ? "bg-primary/10" : "bg-black"}`}>
        {role === "assistant" ? (
          <>
            <AvatarFallback>AI</AvatarFallback>
            <AvatarImage src="/ai-avatar.png" alt="AI Assistant" />
          </>
        ) : (
          <>
            <AvatarFallback>U</AvatarFallback>
            <AvatarImage src="/user-avatar.png" alt="User" />
          </>
        )}
      </Avatar>
      
      {/* Message content */}
      <div
        className={`flex-1 px-4 py-2 rounded-lg ${
          role === "assistant"
            ? "bg-muted"
            : "bg-primary text-primary-foreground"
        }`}
      >
        <div className="prose prose-sm">
          {formatMessage(content)}
        </div>
        <div
          className={`text-xs mt-1 ${
            role === "assistant" ? "text-gray-500" : "text-primary-foreground/80"
          }`}
        >
          {timeAgo}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
