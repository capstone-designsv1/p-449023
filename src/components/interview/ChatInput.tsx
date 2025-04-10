
import React, { useState, useEffect } from "react";
import InterviewChatInput from "./InterviewChatInput";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isSending: boolean;
  inputText?: string;
  setInputText?: (text: string) => void;
  isVoiceMode?: boolean;
  isListening?: boolean;
  toggleListening?: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isSending,
  inputText,
  setInputText,
  isVoiceMode,
  isListening,
  toggleListening
}) => {
  const [newMessage, setNewMessage] = useState("");
  const [isInitializing, setIsInitializing] = useState(false);
  
  // Sync with external input text if provided
  useEffect(() => {
    if (inputText !== undefined) {
      setNewMessage(inputText);
    }
  }, [inputText]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || isSending) return;
    
    onSendMessage(newMessage);
    setNewMessage("");
    
    if (setInputText) {
      setInputText("");
    }
  };

  return (
    <InterviewChatInput
      newMessage={newMessage}
      setNewMessage={setNewMessage}
      handleSendMessage={handleSendMessage}
      isSending={isSending}
      isInitializing={isInitializing}
      isListening={isListening}
      toggleListening={toggleListening}
      isVoiceMode={isVoiceMode}
    />
  );
};

export default ChatInput;
