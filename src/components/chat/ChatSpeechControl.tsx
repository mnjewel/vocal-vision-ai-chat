
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { speakText } from '@/integrations/elevenlabs/service';
import { toast } from 'sonner';
import { useSettingsStore } from '@/stores/settingsStore';

interface ChatSpeechControlProps {
  text: string;
  messageId: string;
}

const ChatSpeechControl: React.FC<ChatSpeechControlProps> = ({ text, messageId }) => {
  const [useElevenLabs, setUseElevenLabs] = useState<boolean>(false);
  const [isPlayingElevenLabs, setIsPlayingElevenLabs] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  
  // Get speech synthesis settings from store
  const { 
    enableTextToSpeech, 
    preferElevenLabs,
    elevenlabsVoiceId 
  } = useSettingsStore();
  
  // Use the Web Speech API hook
  const { speak, stop, isPlaying, isSupported } = useSpeechSynthesis({ 
    text: text.replace(/<[^>]*>?/gm, '') // Strip HTML tags
  });

  // Toggle between Web Speech API and ElevenLabs
  const toggleSpeechProvider = () => {
    if (isPlaying) stop();
    if (isPlayingElevenLabs && audioRef.current) {
      audioRef.current.pause();
      setIsPlayingElevenLabs(false);
    }
    setUseElevenLabs(!useElevenLabs);
  };

  // Handle speech playback
  const handleSpeak = async () => {
    try {
      if ((useElevenLabs || preferElevenLabs) && !isPlayingElevenLabs) {
        setIsPlayingElevenLabs(true);
        const cleanText = text.replace(/<[^>]*>?/gm, ''); // Strip HTML tags
        const url = await speakText(cleanText, elevenlabsVoiceId);
        
        if (url) {
          setAudioUrl(url);
          if (audioRef.current) {
            audioRef.current.src = url;
            audioRef.current.onended = () => setIsPlayingElevenLabs(false);
            audioRef.current.play();
          }
        } else {
          setIsPlayingElevenLabs(false);
          toast.error('Failed to generate speech. Using browser speech instead.');
          if (isSupported) speak();
        }
      } else if (isSupported && !isPlaying) {
        speak();
      } else if (isPlaying) {
        stop();
      } else if (isPlayingElevenLabs && audioRef.current) {
        audioRef.current.pause();
        setIsPlayingElevenLabs(false);
      }
    } catch (error) {
      console.error('Error speaking text:', error);
      setIsPlayingElevenLabs(false);
      toast.error('Failed to speak text. Please try again.');
    }
  };

  // Stop playback when component unmounts
  React.useEffect(() => {
    return () => {
      if (isPlaying) stop();
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [isPlaying, stop]);

  // Don't render if text-to-speech is disabled
  if (!enableTextToSpeech) return null;

  return (
    <div className="flex items-center space-x-1 mt-1">
      <audio ref={audioRef} className="hidden" />
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-6 w-6 rounded-full opacity-70 hover:opacity-100"
        onClick={handleSpeak}
        disabled={!text.trim()}
        title={isPlaying || isPlayingElevenLabs ? "Stop speaking" : "Read message aloud"}
      >
        {isPlaying || isPlayingElevenLabs ? 
          <VolumeX className="h-3.5 w-3.5" /> : 
          <Volume2 className="h-3.5 w-3.5" />
        }
      </Button>
      
      {/* Optional toggle between speech providers */}
      {false && (
        <Button
          variant="ghost"
          size="sm"
          className="text-xs opacity-60 hover:opacity-100"
          onClick={toggleSpeechProvider}
        >
          {useElevenLabs ? "Use Browser TTS" : "Use ElevenLabs"}
        </Button>
      )}
    </div>
  );
};

export default ChatSpeechControl;
