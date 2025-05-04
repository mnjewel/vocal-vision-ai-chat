
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
import useSpeechRecognition from '@/hooks/useSpeechRecognition';
import { toast } from 'sonner';

interface VoiceConversationPanelProps {
  onTranscriptReady?: (text: string) => void;
}

const VoiceConversationPanel: React.FC<VoiceConversationPanelProps> = ({ 
  onTranscriptReady 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const { startListening, stopListening, transcript, isSupported, isListening } = useSpeechRecognition();
  
  // Sync the recording state with the actual listening state
  useEffect(() => {
    setIsRecording(isListening);
  }, [isListening]);

  // Effect to handle transcript updates
  useEffect(() => {
    if (transcript && transcript.trim() !== '' && onTranscriptReady && !isListening) {
      onTranscriptReady(transcript);
    }
  }, [transcript, isListening, onTranscriptReady]);

  const handleToggleRecording = () => {
    if (!isSupported) {
      toast.error("Speech recognition is not supported in your browser");
      return;
    }

    if (isRecording) {
      stopListening();
    } else {
      startListening();
      toast.info("Listening...");
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      className={`h-8 w-8 ${isRecording ? 'bg-red-100 dark:bg-red-900/20 border-red-500' : ''}`}
      onClick={handleToggleRecording}
      title={isRecording ? "Stop recording" : "Start voice recording"}
      disabled={!isSupported}
    >
      {isRecording ? 
        <MicOff className="h-4 w-4 text-red-500" /> : 
        <Mic className="h-4 w-4" />
      }
    </Button>
  );
};

export default VoiceConversationPanel;
