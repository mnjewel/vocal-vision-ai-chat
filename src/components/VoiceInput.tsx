
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import useSpeechRecognition from '@/hooks/useSpeechRecognition';
import { Mic } from 'lucide-react';

interface VoiceInputProps {
  onTranscriptComplete: (transcript: string) => void;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscriptComplete }) => {
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
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div>
      <Button
        type="button"
        variant={isListening ? "destructive" : "outline"}
        size="icon"
        disabled={!isSupported}
        onClick={toggleListening}
        className={`relative ${isListening ? 'animate-pulse' : ''}`}
        title={isSupported ? 'Click to speak' : 'Voice input not supported in your browser'}
      >
        <Mic className={`h-4 w-4 ${isListening ? 'text-white' : ''}`} />
        {isListening && (
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500"></span>
        )}
      </Button>

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
