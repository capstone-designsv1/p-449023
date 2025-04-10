
import React from "react";
import { useInterviewChat } from "@/hooks/useInterviewChat";
import ChatMessages from "./ChatMessages";
import InterviewChatInput from "./InterviewChatInput";
import InterviewVoiceModeToggle from "./InterviewVoiceModeToggle";
import EndInterviewButton from "./EndInterviewButton";
import InitializingIndicator from "./InitializingIndicator";
import { FormattedFeedback } from "@/services/interviewChatService";

interface ChatInterfaceProps {
  companyName: string;
  designLevel: "Junior" | "Senior" | "Lead";
  onSessionEnd: (feedback: FormattedFeedback) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  companyName,
  designLevel,
  onSessionEnd,
}) => {
  const {
    chatHistory,
    isInitializing,
    messagesEndRef,
    newMessage,
    setNewMessage,
    isSending,
    isVoiceMode,
    isListening,
    isSpeaking,
    currentVoice,
    handleSendMessage,
    handleEndSession,
    toggleVoiceMode,
    toggleListening,
    toggleSpeaking,
    changeVoice
  } = useInterviewChat({
    companyName,
    designLevel,
    onSessionEnd
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 mb-4">
        {isInitializing ? (
          <InitializingIndicator />
        ) : (
          <ChatMessages 
            messages={chatHistory} 
            messagesEndRef={messagesEndRef}
            isSpeaking={isSpeaking}
            toggleSpeaking={toggleSpeaking}
          />
        )}
      </div>

      <div className="border-t p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center gap-2">
            <InterviewVoiceModeToggle 
              isVoiceMode={isVoiceMode}
              toggleVoiceMode={toggleVoiceMode}
            />
          
            <InterviewChatInput 
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              handleSendMessage={handleSendMessage}
              isSending={isSending}
              isInitializing={isInitializing}
              isListening={isListening}
              toggleListening={isVoiceMode ? toggleListening : undefined}
              isVoiceMode={isVoiceMode}
            />
          </div>

          <EndInterviewButton 
            handleEndSession={handleEndSession}
            isSending={isSending}
            isInitializing={isInitializing}
            chatHistoryLength={chatHistory.length}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
