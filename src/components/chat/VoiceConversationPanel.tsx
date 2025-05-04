
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
import useSpeechRecognition from '@/hooks/useSpeechRecognition';

const VoiceConversationPanel: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const { startListening, stopListening, transcript, resetTranscript } = useSpeechRecognition();

  const handleToggleRecording = () => {
    if (isRecording) {
      stopListening();
      setIsRecording(false);
    } else {
      resetTranscript();
      startListening();
      setIsRecording(true);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      className="h-8 w-8"
      onClick={handleToggleRecording}
      title={isRecording ? "Stop recording" : "Start voice recording"}
    >
      {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
    </Button>
  );
};

export default VoiceConversationPanel;
