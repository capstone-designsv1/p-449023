
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface UseInterviewChatProps {
  companyName: string;
  designLevel: "Junior" | "Senior" | "Lead";
  onSessionEnd: (feedback: string) => void;
}

export const useInterviewChat = ({
  companyName,
  designLevel,
  onSessionEnd,
}: UseInterviewChatProps) => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const lastAssistantMessageRef = useRef<string | null>(null);
  const MAX_RETRIES = 2;

  // Initialize audio player
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioPlayerRef.current = new Audio();
      audioPlayerRef.current.addEventListener('ended', () => {
        setIsSpeaking(false);
      });
    }
    
    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.src = '';
      }
    };
  }, []);

  // Initialize chat with first AI message
  useEffect(() => {
    initializeChat();
  }, [companyName, designLevel]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
    
    // Speak the last assistant message if voice mode is enabled
    if (isVoiceMode && chatHistory.length > 0) {
      const lastMessage = chatHistory[chatHistory.length - 1];
      if (lastMessage.role === 'assistant' && lastMessage.content !== lastAssistantMessageRef.current) {
        lastAssistantMessageRef.current = lastMessage.content;
        speakText(lastMessage.content);
      }
    }
  }, [chatHistory, isVoiceMode]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initializeChat = async () => {
    setIsInitializing(true);
    try {
      const response = await supabase.functions.invoke('interview-chat', {
        body: {
          action: "start",
          companyName: companyName,
          designLevel: designLevel
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: response.data.message,
        timestamp: new Date()
      };

      setChatHistory([aiMessage]);
    } catch (error) {
      console.error("Error initializing chat:", error);
      toast.error("Failed to start the interview. Using a default prompt.");
      
      // Add a fallback first message if API fails
      const fallbackMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: `Hello! I'm a product design interviewer from ${companyName}. Today, I'll be evaluating your design skills for a ${designLevel} position. Let's start with a challenge: Design a feature that would improve user engagement for our core product. Could you walk me through your approach?`,
        timestamp: new Date()
      };
      
      setChatHistory([fallbackMessage]);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: newMessage,
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, userMessage]);
    setNewMessage("");
    setIsSending(true);
    setRetryCount(0);

    try {
      await sendMessageToAI(newMessage);
    } catch (error) {
      console.error("Error sending message:", error);
      handleRetryOrFallback();
    } finally {
      setIsSending(false);
    }
  };

  const sendMessageToAI = async (message: string) => {
    const response = await supabase.functions.invoke('interview-chat', {
      body: {
        action: "chat",
        message: message,
        history: chatHistory.map(msg => ({
          role: msg.role === "assistant" ? "assistant" : "user",
          content: msg.content
        })),
        companyName: companyName,
        designLevel: designLevel
      }
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    const aiMessage: ChatMessage = {
      id: `ai-${Date.now()}`,
      role: "assistant",
      content: response.data.message,
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, aiMessage]);
  };

  const handleRetryOrFallback = async () => {
    if (retryCount < MAX_RETRIES) {
      toast.info(`Retrying... (${retryCount + 1}/${MAX_RETRIES})`);
      setRetryCount(prev => prev + 1);
      try {
        await sendMessageToAI(newMessage);
      } catch (error) {
        console.error("Retry failed:", error);
        if (retryCount + 1 >= MAX_RETRIES) {
          addFallbackResponse();
        } else {
          handleRetryOrFallback();
        }
      }
    } else {
      addFallbackResponse();
    }
  };

  const addFallbackResponse = () => {
    toast.error("Failed to get a response. Using a fallback response.");
    
    const fallbackResponse: ChatMessage = {
      id: `ai-${Date.now()}`,
      role: "assistant",
      content: "I'm having trouble processing your response right now. That's an interesting perspective though. Could you elaborate more on your design approach and how you would validate your solution with users?",
      timestamp: new Date()
    };
    
    setChatHistory(prev => [...prev, fallbackResponse]);
  };

  const handleEndSession = async () => {
    setIsSending(true);
    try {
      const response = await supabase.functions.invoke('interview-chat', {
        body: {
          action: "end",
          history: chatHistory.map(msg => ({
            role: msg.role === "assistant" ? "assistant" : "user",
            content: msg.content
          })),
          companyName: companyName,
          designLevel: designLevel
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const feedback = response.data.feedback || response.data.message;
      onSessionEnd(feedback);
    } catch (error) {
      console.error("Error ending session:", error);
      toast.error("Could not generate feedback. Using a default evaluation.");
      
      // Provide fallback evaluation
      const fallbackFeedback = `Thank you for participating in this design interview for ${companyName}. 

Based on our conversation, here's my evaluation:

Overall Score: 75/100

Strengths:
- You showed good communication skills
- You demonstrated knowledge of design principles
- You approached the problem with a user-centered mindset

Areas for Improvement:
- Consider incorporating more data-driven decision making
- Expand on how you would test and validate your solutions
- Delve deeper into edge cases and accessibility concerns

This is a simplified evaluation as we're currently experiencing technical difficulties. In a real interview setting, we would provide more specific feedback based on your answers.`;
      
      onSessionEnd(fallbackFeedback);
    } finally {
      setIsSending(false);
    }
  };

  // Voice assistant functions
  const toggleVoiceMode = () => {
    if (!isVoiceMode) {
      // Ask for microphone permission before enabling
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          setIsVoiceMode(true);
          toast.success("Voice mode enabled", { duration: 2000 });
        })
        .catch((err) => {
          console.error("Microphone permission denied:", err);
          toast.error("Microphone access is required for voice mode");
        });
    } else {
      // Disable voice mode
      if (isListening) stopListening();
      if (isSpeaking) stopSpeaking();
      setIsVoiceMode(false);
      toast.success("Voice mode disabled", { duration: 2000 });
    }
  };

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();
          
          reader.onload = async function(event) {
            if (!event.target) return;
            
            const base64Audio = (event.target.result as string).split(',')[1];
            
            try {
              const response = await supabase.functions.invoke('speech-to-text', {
                body: { audio: base64Audio }
              });
              
              if (response.error) {
                throw new Error(response.error.message);
              }
              
              if (response.data && response.data.text) {
                setNewMessage(response.data.text);
                // Auto-send the transcribed message
                if (response.data.text.trim()) {
                  const userMessage: ChatMessage = {
                    id: `user-${Date.now()}`,
                    role: "user",
                    content: response.data.text,
                    timestamp: new Date()
                  };
                  
                  setChatHistory(prev => [...prev, userMessage]);
                  setNewMessage("");
                  setIsSending(true);
                  
                  try {
                    await sendMessageToAI(response.data.text);
                  } catch (error) {
                    console.error("Error sending message:", error);
                    handleRetryOrFallback();
                  } finally {
                    setIsSending(false);
                  }
                }
              } else {
                throw new Error('Failed to transcribe audio');
              }
            } catch (error) {
              console.error('Transcription error:', error);
              toast.error('Failed to transcribe your speech. Please try again.');
              setIsListening(false);
            }
          };
          
          reader.readAsDataURL(audioBlob);
        } catch (error) {
          console.error('Error processing audio:', error);
          toast.error('Error processing audio. Please try again.');
          setIsListening(false);
        }
      };

      mediaRecorder.start();
      setIsListening(true);
      toast.info("Listening... Speak now", { duration: 3000 });
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Could not access your microphone. Please check permissions and try again.');
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsListening(false);
      toast.info("Stopped listening", { duration: 1500 });
    }
  };

  const speakText = async (text: string, voice = 'alloy') => {
    if (!text || isSpeaking) return;
    
    try {
      setIsSpeaking(true);
      toast.info("AI is speaking...", { duration: 2000 });
      
      const response = await supabase.functions.invoke('text-to-speech', {
        body: { text, voice }
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (!response.data || !response.data.audioContent) {
        throw new Error('No audio content received');
      }
      
      // Convert base64 to audio
      const blob = await (await fetch(
        `data:audio/mp3;base64,${response.data.audioContent}`
      )).blob();
      
      const url = URL.createObjectURL(blob);
      
      if (audioPlayerRef.current) {
        audioPlayerRef.current.src = url;
        await audioPlayerRef.current.play();
      }
    } catch (error) {
      console.error('Error speaking text:', error);
      toast.error('Failed to convert text to speech. Please try again.');
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    if (audioPlayerRef.current && !audioPlayerRef.current.paused) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
      setIsSpeaking(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const toggleSpeaking = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else if (chatHistory.length > 0) {
      // Find the last assistant message
      const lastAssistantMessage = [...chatHistory].reverse().find(msg => msg.role === 'assistant');
      if (lastAssistantMessage) {
        speakText(lastAssistantMessage.content);
      }
    }
  };

  return {
    chatHistory,
    isInitializing,
    messagesEndRef,
    newMessage,
    setNewMessage,
    isSending,
    isVoiceMode,
    isListening,
    isSpeaking,
    handleSendMessage,
    handleEndSession,
    toggleVoiceMode,
    toggleListening,
    toggleSpeaking
  };
};
