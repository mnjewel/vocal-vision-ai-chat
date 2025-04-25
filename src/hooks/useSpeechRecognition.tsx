
import { useState, useEffect, useCallback, useRef } from 'react';

interface UseSpeechRecognitionProps {
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
  continuous?: boolean;
}

const useSpeechRecognition = ({
  onResult,
  onError,
  onEnd,
  continuous = false,
}: UseSpeechRecognitionProps = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  // Check if browser supports speech recognition
  useEffect(() => {
    const SpeechRecognitionAPI = 
      window.SpeechRecognition || 
      window.webkitSpeechRecognition;
    
    if (SpeechRecognitionAPI) {
      setIsSupported(true);
    } else {
      setIsSupported(false);
      onError?.('Speech recognition is not supported in this browser.');
    }
  }, [onError]);

  // Start listening function
  const startListening = useCallback(() => {
    if (!isSupported) return;
    
    const SpeechRecognitionAPI = 
      window.SpeechRecognition || 
      window.webkitSpeechRecognition;
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    recognitionRef.current = new SpeechRecognitionAPI();
    
    const recognition = recognitionRef.current;
    recognition.continuous = continuous;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
    };
    
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      
      setTranscript(transcript);
      onResult?.(transcript);
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      onError?.(event.error);
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
      onEnd?.();
    };
    
    recognition.start();
  }, [isSupported, onResult, onError, onEnd, continuous]);

  // Stop listening function
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return {
    isListening,
    startListening,
    stopListening,
    transcript,
    isSupported,
  };
};

export default useSpeechRecognition;
