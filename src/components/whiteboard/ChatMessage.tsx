import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronRight, Headphones, VolumeX } from "lucide-react";
import PlayResponseButton from "./PlayResponseButton";

interface ChatMessageProps {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isSpeaking?: boolean;
  toggleSpeaking?: () => void;
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

const ChatMessage: React.FC<ChatMessageProps> = ({ 
  id, 
  role, 
  content, 
  timestamp, 
  isSpeaking,
  toggleSpeaking 
}) => {
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
      <div className="flex-1">
        {chunks.slice(0, visibleChunks).map((chunk, idx) => (
          <div
            key={`${id}-chunk-${idx}`}
            className={`px-4 py-2 rounded-lg mb-2 ${
              role === "assistant"
                ? "bg-muted"
                : "bg-primary text-primary-foreground"
            }`}
          >
            <div className="prose prose-sm">
              {formatMessage(chunk)}
            </div>
            <div className="flex items-center justify-between mt-1">
              <div
                className={`text-xs ${
                  role === "assistant" ? "text-gray-500" : "text-primary-foreground/80"
                }`}
              >
                {timeAgo}
              </div>
              
              {/* Play Response button for assistant messages */}
              {role === "assistant" && idx === 0 && toggleSpeaking && (
                <PlayResponseButton
                  isSpeaking={!!isSpeaking}
                  toggleSpeaking={toggleSpeaking}
                />
              )}
            </div>
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
