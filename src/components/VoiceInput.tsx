
import React, { useState, useEffect, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import useSpeechRecognition from '@/hooks/useSpeechRecognition';
import { Mic, MicOff } from 'lucide-react';
import { toast } from 'sonner';

export interface VoiceInputProps {
  onTranscriptComplete: (transcript: string) => void;
  children?: ReactNode;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscriptComplete, children }) => {
  const [voiceMessage, setVoiceMessage] = useState('');
  
  const {
    isListening,
    startListening,
    stopListening,
    transcript,
    isSupported
  } = useSpeechRecognition({
    onResult: (result) => setVoiceMessage(result),
    onEnd: () => {
      if (voiceMessage.trim()) {
        onTranscriptComplete(voiceMessage);
        setVoiceMessage('');
      }
    }
  });

  // If transcript changes, update voiceMessage
  useEffect(() => {
    setVoiceMessage(transcript);
  }, [transcript]);

  // Toggle listening state
  const toggleListening = () => {
    if (!isSupported) {
      toast.error("Speech recognition is not supported in your browser");
      return;
    }
    
    if (isListening) {
      stopListening();
    } else {
      try {
        startListening();
      } catch (error) {
        console.error("Error starting speech recognition:", error);
        toast.error("Could not access microphone. Please check permissions.");
      }
    }
  };

  return (
    <div>
      {children ? (
        <div 
          onClick={toggleListening}
          className={isListening ? 'animate-pulse' : ''}
        >
          {children}
        </div>
      ) : (
        <Button
          type="button"
          variant={isListening ? "destructive" : "outline"}
          size="icon"
          disabled={!isSupported}
          onClick={toggleListening}
          className={`relative ${isListening ? 'animate-pulse' : ''}`}
          title={isSupported ? 'Click to speak' : 'Voice input not supported in your browser'}
        >
          {isListening ? <MicOff className="h-4 w-4 text-white" /> : <Mic className="h-4 w-4" />}
          {isListening && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500"></span>
          )}
        </Button>
      )}

      {isListening && voiceMessage && (
        <div className="fixed bottom-20 left-0 right-0 mx-auto w-11/12 max-w-2xl p-4 bg-background/80 backdrop-blur-lg border rounded-lg shadow-lg z-10 animate-fade-in">
          <p className="text-sm font-medium mb-1">Listening...</p>
          <p className="text-base">{voiceMessage}</p>
        </div>
      )}
    </div>
  );
};

export default VoiceInput;
