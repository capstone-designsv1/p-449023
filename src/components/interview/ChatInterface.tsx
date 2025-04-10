import React, { useState } from "react";
import { useChallengeContext } from "@/context/ChallengeContext";
import ChatMessageList from "./ChatMessageList";
import ChatInput from "./ChatInput";
import SubmitEvaluationButton from "./SubmitEvaluationButton";
import { useChatLogic } from "@/hooks/useChatLogic";
import { useVoiceControl } from "@/hooks/useVoiceControl";
import VoiceModeToggle from "./VoiceModeToggle";
import { FormattedFeedback, ChatMessage } from "@/services/interview";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ChatInterfaceProps {
  companyName: string;
  designLevel: "Junior" | "Senior" | "Lead";
  onSessionEnd: (feedback: FormattedFeedback) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  companyName,
  designLevel,
  onSessionEnd
}) => {
  const { chatHistory, setChatHistory, activeChallenge } = useChallengeContext();
  const { isSending, sendMessage } = useChatLogic(activeChallenge, chatHistory, setChatHistory);
  
  const {
    isVoiceMode,
    isListening,
    isSpeaking,
    inputText,
    setInputText,
    toggleVoiceMode,
    toggleListening,
    toggleSpeaking
  } = useVoiceControl({
    chatHistory,
    sendMessage
  });

  // Handle evaluating state and submission
  const [isEvaluating, setIsEvaluating] = useState(false);

  const handleSubmitForEvaluation = async (data: { chatHistory?: ChatMessage[] }) => {
    if (!data.chatHistory) return;
    
    setIsEvaluating(true);
    try {
      const response = await supabase.functions.invoke('interview-chat', {
        body: {
          action: "end",
          history: data.chatHistory.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          companyName,
          designLevel
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data && response.data.feedback) {
        onSessionEnd(response.data.feedback);
      } else {
        throw new Error('No feedback received');
      }
    } catch (error) {
      console.error("Error getting feedback:", error);
      toast.error("Failed to get feedback. Please try again later.");
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col mb-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Interview Partner</h2>
        <VoiceModeToggle 
          isVoiceMode={isVoiceMode}
          toggleVoiceMode={toggleVoiceMode}
        />
      </div>
      
      {/* Chat Messages */}
      <ChatMessageList 
        messages={chatHistory}
        isSpeaking={isSpeaking}
        toggleSpeaking={toggleSpeaking}
      />
      
      {/* Message Input */}
      <ChatInput 
        onSendMessage={sendMessage} 
        isSending={isSending}
        inputText={inputText}
        setInputText={setInputText}
        isVoiceMode={isVoiceMode}
        isListening={isListening}
        toggleListening={toggleListening}
      />
      
      {/* Submit for Evaluation Button */}
      <SubmitEvaluationButton 
        chatHistory={chatHistory}
        onSubmit={handleSubmitForEvaluation}
        isEvaluating={isEvaluating}
      />
    </div>
  );
};

export default ChatInterface;
