
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

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

// Function to split content into digestible chunks
const splitIntoChunks = (content: string): string[] => {
  // Split by double line breaks or sections with headings
  const chunks = content.split(/\n\n(?=#{1,3}\s|[A-Z][a-z]+:)/).filter(chunk => chunk.trim() !== "");
  
  // If we don't have multiple chunks or they're all very small, return the whole content as one chunk
  if (chunks.length <= 1 || chunks.every(chunk => chunk.length < 100)) {
    return [content];
  }
  
  // Merge very small chunks with the previous chunk
  const mergedChunks: string[] = [];
  let currentChunk = "";
  
  for (const chunk of chunks) {
    if (currentChunk.length + chunk.length < 300) {
      currentChunk += (currentChunk ? "\n\n" : "") + chunk;
    } else {
      if (currentChunk) {
        mergedChunks.push(currentChunk);
      }
      currentChunk = chunk;
    }
  }
  
  if (currentChunk) {
    mergedChunks.push(currentChunk);
  }
  
  return mergedChunks;
};

const ChatMessage: React.FC<ChatMessageProps> = ({ id, role, content, timestamp }) => {
  const [visibleChunks, setVisibleChunks] = useState<number>(1);
  const chunks = role === "assistant" ? splitIntoChunks(content) : [content];
  const hasMoreChunks = visibleChunks < chunks.length;
  
  // Format the relative time (e.g., "5 minutes ago")
  const timeAgo = formatDistanceToNow(new Date(timestamp), { addSuffix: true });

  // Show next chunk of the message
  const showNextChunk = () => {
    setVisibleChunks(prev => Math.min(prev + 1, chunks.length));
  };
  
  return (
    <div 
      className={`flex items-start gap-3 mb-4 px-6 ${
        role === "user" ? "flex-row-reverse" : ""
      }`}
    >
      {/* Avatar */}
      <Avatar className={`h-8 w-8 ${role === "assistant" ? "bg-green-100" : "bg-purple-100"}`}>
        <AvatarFallback className={role === "assistant" ? "text-green-500" : "text-purple-500"}>
          {role === "assistant" ? "AI" : "A"}
        </AvatarFallback>
      </Avatar>
      
      {/* Message content */}
      <div className="max-w-[85%]">
        {chunks.slice(0, visibleChunks).map((chunk, idx) => (
          <div
            key={`${id}-chunk-${idx}`}
            className={`px-4 py-3 rounded-2xl mb-2 ${
              role === "assistant"
                ? "bg-green-100 text-gray-800"
                : "bg-purple-100 text-gray-800"
            }`}
          >
            <div className="prose prose-sm">
              {formatMessage(chunk)}
            </div>
            {idx === visibleChunks - 1 && (
              <div className="text-xs mt-1 text-gray-500">
                {timeAgo}
              </div>
            )}
          </div>
        ))}
        
        {/* Continue button for long assistant messages */}
        {role === "assistant" && hasMoreChunks && (
          <Button 
            onClick={showNextChunk} 
            variant="outline" 
            size="sm" 
            className="ml-2 mt-1 flex items-center gap-1 text-xs"
          >
            Continue <ChevronRight className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
