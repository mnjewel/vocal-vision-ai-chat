
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Mic, MicOff, Play, Square, Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';

interface VoiceConversationProps {
  onTranscriptComplete: (transcript: string) => void;
  onAIResponseReceived?: (response: string) => void;
  apiKey?: string;
}

const ELEVEN_LABS_API_KEY = "sk-fd35e9a66288e0ceeca9e348f5506815764ce9c29da1d8b6";

const VoiceConversation: React.FC<VoiceConversationProps> = ({ 
  onTranscriptComplete,
  onAIResponseReceived
}) => {
  // State for conversation
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [lastResponseText, setLastResponseText] = useState('');

  // Refs
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Setup audio context and analyser for visualizing audio levels
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      return () => {
        if (audioContextRef.current?.state !== 'closed') {
          audioContextRef.current?.close();
        }
      };
    }
  }, []);

  // Update audio level for visualization
  useEffect(() => {
    if (!analyserRef.current || !isListening) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const updateAudioLevel = () => {
      if (!analyserRef.current || !isListening) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      // Calculate average volume level (0-1)
      const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length / 255;
      setAudioLevel(average);
      
      if (isListening) {
        requestAnimationFrame(updateAudioLevel);
      }
    };
    
    requestAnimationFrame(updateAudioLevel);
  }, [isListening]);

  // Initialize speech recognition
  const initializeSpeechRecognition = () => {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      toast.error('Speech recognition is not supported in this browser.');
      return false;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';
    
    recognitionRef.current.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      
      setTranscript(transcript);
    };
    
    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      toast.error(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };
    
    recognitionRef.current.onend = () => {
      setIsListening(false);
    };
    
    return true;
  };

  // Start conversation with ElevenLabs
  const startConversation = async () => {
    try {
      // Get a signed URL from the server to establish a secure connection
      // In a real app, you would get this from your backend
      const response = await fetch('https://api.elevenlabs.io/v1/convai/conversation/get_signed_url', {
        method: 'GET',
        headers: {
          'xi-api-key': ELEVEN_LABS_API_KEY,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to get signed URL');
      }
      
      const data = await response.json();
      setConversationId(data.conversation_id);
      setIsConnected(true);
      
      toast.success('Voice conversation started');
      
      // Start listening
      if (initializeSpeechRecognition()) {
        startListening();
      }
      
      return data.conversation_id;
    } catch (error) {
      console.error('Failed to start conversation:', error);
      toast.error('Failed to start voice conversation. Please try again.');
      return null;
    }
  };

  // End conversation with ElevenLabs
  const endConversation = async () => {
    if (!conversationId) return;
    
    try {
      // End the conversation session
      await fetch(`https://api.elevenlabs.io/v1/convai/conversation/${conversationId}/end`, {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVEN_LABS_API_KEY,
          'Content-Type': 'application/json'
        }
      });
      
      setIsConnected(false);
      setConversationId(null);
      stopListening();
      toast.success('Voice conversation ended');
    } catch (error) {
      console.error('Failed to end conversation:', error);
      toast.error('Failed to end voice conversation properly.');
    }
  };

  // Start listening via microphone
  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      if (audioContextRef.current && analyserRef.current) {
        micStreamRef.current = audioContextRef.current.createMediaStreamSource(stream);
        micStreamRef.current.connect(analyserRef.current);
      }
      
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
      }
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Failed to access microphone. Please check your permissions.');
    }
  };

  // Stop listening via microphone
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    if (micStreamRef.current) {
      micStreamRef.current.disconnect();
      micStreamRef.current = null;
    }
    
    setIsListening(false);
  };

  // Toggle mute state
  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Send transcript to ElevenLabs for processing
  const sendTranscript = async () => {
    if (!transcript.trim() || !conversationId) return;
    
    stopListening();
    
    try {
      // Send the message to ElevenLabs
      const response = await fetch(`https://api.elevenlabs.io/v1/convai/conversation/${conversationId}/message`, {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVEN_LABS_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: transcript })
      });
      
      if (!response.ok) {
        throw new Error('Failed to process message');
      }
      
      const data = await response.json();
      
      // Notify parent component
      onTranscriptComplete(transcript);
      setTranscript('');
      
      // Process AI response
      if (data.response) {
        setLastResponseText(data.response);
        
        if (onAIResponseReceived) {
          onAIResponseReceived(data.response);
        }
        
        // Convert text to speech
        await convertTextToSpeech(data.response);
      }
    } catch (error) {
      console.error('Failed to process transcript:', error);
      toast.error('Failed to process your message. Please try again.');
    }
  };

  // Convert text to speech using ElevenLabs
  const convertTextToSpeech = async (text: string) => {
    try {
      setIsSpeaking(true);
      
      const voice_id = "EXAVITQu4vr4xnSDxMaL"; // Aria voice
      
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`, {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVEN_LABS_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true
          }
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to convert text to speech');
      }
      
      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.volume = 1.0;
        audioRef.current.play();
      }
    } catch (error) {
      console.error('Failed to convert text to speech:', error);
      toast.error('Failed to generate speech. Please try again.');
    } finally {
      setIsSpeaking(false);
    }
  };

  // Toggle conversation state (start/stop)
  const toggleConversation = async () => {
    if (isConnected) {
      await endConversation();
    } else {
      await startConversation();
    }
  };

  // Handle audio ended event
  const handleAudioEnded = () => {
    setIsSpeaking(false);
    // Restart listening after AI response is done
    if (isConnected && !isListening) {
      startListening();
    }
  };

  return (
    <div className="voice-conversation">
      {/* Audio element for playing AI responses */}
      <audio 
        ref={audioRef} 
        onEnded={handleAudioEnded}
        className="hidden"
      />
      
      <div className="flex flex-col gap-3">
        {/* Connection status indicator */}
        <div className="flex items-center">
          <span 
            className={`h-2 w-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} 
          />
          <span className="text-xs font-medium">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        
        {/* Audio level indicator */}
        {isListening && (
          <div className="w-full">
            <Progress 
              value={audioLevel * 100} 
              className="h-1"
            />
          </div>
        )}
        
        {/* Conversation controls */}
        <div className="flex gap-2 items-center">
          <Button
            type="button"
            variant={isConnected ? "destructive" : "default"}
            size="sm"
            onClick={toggleConversation}
            className="gap-1.5"
          >
            {isConnected ? (
              <>
                <Square className="h-3.5 w-3.5" />
                <span>End Conversation</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" />
                <span>Start Conversation</span>
              </>
            )}
          </Button>
          
          {isConnected && (
            <>
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={!isConnected || isSpeaking}
                onClick={isListening ? stopListening : startListening}
                className={isListening ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : ''}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={toggleMute}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              
              <Button
                type="button"
                variant="default"
                size="sm"
                disabled={!transcript.trim() || isSpeaking}
                onClick={sendTranscript}
                className="gap-1.5"
              >
                <span>Send</span>
              </Button>
            </>
          )}
        </div>
        
        {/* Transcript display */}
        {isListening && transcript && (
          <div className="mt-2 p-3 bg-background/80 backdrop-blur-sm border rounded-md text-sm">
            <p className="font-medium mb-1 text-xs">Listening:</p>
            <p>{transcript}</p>
          </div>
        )}
        
        {/* Response display */}
        {isSpeaking && lastResponseText && (
          <div className="mt-2 p-3 bg-background/80 backdrop-blur-sm border rounded-md text-sm border-blue-200 dark:border-blue-900">
            <p className="font-medium mb-1 text-xs text-blue-600 dark:text-blue-400">AI Speaking:</p>
            <p>{lastResponseText}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceConversation;
