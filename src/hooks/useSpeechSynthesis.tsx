
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface UseSpeechSynthesisProps {
  text?: string;
}

interface UseSpeechSynthesisReturn {
  speak: () => void;
  stop: () => void;
  isPlaying: boolean;
  isSupported: boolean;
}

export const useSpeechSynthesis = ({ text = '' }: UseSpeechSynthesisProps): UseSpeechSynthesisReturn => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(false);
  
  // Check if speech synthesis is supported
  useEffect(() => {
    setIsSupported(typeof window !== 'undefined' && 'speechSynthesis' in window);
  }, []);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (isPlaying && isSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isPlaying, isSupported]);
  
  const speak = () => {
    if (!isSupported || !text) return;
    
    // Stop any ongoing speech
    stop();
    
    try {
      // Create a new utterance
      const utterance = new SpeechSynthesisUtterance(text.replace(/<[^>]*>?/gm, ''));
      
      // Set properties
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      // Set events
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = (event) => {
        console.error('SpeechSynthesis error:', event);
        setIsPlaying(false);
        toast.error("Speech synthesis error. Please try again.");
      };
      
      // Start speaking
      window.speechSynthesis.speak(utterance);
      
    } catch (error) {
      console.error('Speech synthesis error:', error);
      toast.error("Failed to initialize speech synthesis");
    }
  };
  
  const stop = () => {
    if (!isSupported) return;
    
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };
  
  return {
    speak,
    stop,
    isPlaying,
    isSupported
  };
};

export default useSpeechSynthesis;
