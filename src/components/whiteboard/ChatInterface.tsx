
import React from "react";
import { useChallengeContext } from "@/context/ChallengeContext";
import ChatMessageList from "./ChatMessageList";
import ChatInput from "./ChatInput";
import SubmitEvaluationButton from "./SubmitEvaluationButton";
import { useChatLogic } from "@/hooks/useChatLogic";
import VoiceControls from "./VoiceControls";
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
    isListening,
    isSpeaking,
    currentVoice,
    inputText,
    setInputText,
    toggleVoiceMode,
    toggleListening,
    toggleSpeaking,
    changeVoice
  } = useVoiceControl({
    chatHistory,
    sendMessage
  });

  return (
    <div className="flex-1 flex flex-col mb-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Interview Partner</h2>
      </div>
      
      {/* Chat Messages */}
      <ChatMessageList messages={chatHistory} />
      
      {/* Voice Controls (when voice mode is enabled) */}
      {isVoiceMode && (
        <VoiceControls
          isListening={isListening}
          isSpeaking={isSpeaking}
          isSending={isSending}
          toggleListening={toggleListening}
          toggleSpeaking={toggleSpeaking}
          hasChatHistory={chatHistory.length > 0}
          currentVoice={currentVoice}
          onChangeVoice={changeVoice}
        />
      )}
      
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
      <SubmitEvaluationButton 
        chatHistory={chatHistory}
        onSubmit={onSubmitForEvaluation}
        isEvaluating={isEvaluating}
      />
    </div>
  );
};

export default ChatInterface;
