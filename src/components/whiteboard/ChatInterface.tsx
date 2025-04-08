
import React from "react";
import { useChallengeContext } from "@/context/ChallengeContext";
import ChatMessageList from "./ChatMessageList";
import ChatInput from "./ChatInput";
import SubmitEvaluationButton from "./SubmitEvaluationButton";
import { useChatLogic } from "@/hooks/useChatLogic";
import { useVoiceControl } from "@/hooks/useVoiceControl";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  onSubmitForEvaluation: (data: { chatHistory?: ChatMessage[] }) => void;
  isEvaluating: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  onSubmitForEvaluation,
  isEvaluating
}) => {
  const { chatHistory, setChatHistory, activeChallenge } = useChallengeContext();
  const { isSending, sendMessage } = useChatLogic(activeChallenge, chatHistory, setChatHistory);
  
  const {
    isVoiceMode,
    inputText,
    setInputText,
    toggleVoiceMode
  } = useVoiceControl({
    chatHistory,
    sendMessage
  });

  return (
    <div className="flex flex-col h-full">
      {/* Chat Messages */}
      <ChatMessageList messages={chatHistory} />
      
      {/* Message Input */}
      <ChatInput 
        onSendMessage={sendMessage} 
        isSending={isSending}
        inputText={inputText}
        setInputText={setInputText}
        isVoiceMode={isVoiceMode}
        toggleVoiceMode={toggleVoiceMode}
      />
      
      {/* Submit for Evaluation Button */}
      <div className="px-6 pb-4">
        <SubmitEvaluationButton 
          chatHistory={chatHistory}
          onSubmit={onSubmitForEvaluation}
          isEvaluating={isEvaluating}
        />
      </div>
    </div>
  );
};

export default ChatInterface;
