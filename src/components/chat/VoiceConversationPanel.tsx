
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, BarChart3 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import useSpeechRecognition from '@/hooks/useSpeechRecognition';
import { useToast } from '@/components/ui/use-toast';
import { transcribeAudioGroq } from '@/integrations/groq/service';

const VoiceConversationPanel: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcript, setTranscript] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [audioVisualization, setAudioVisualization] = useState<number[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const { toast } = useToast();

  const {
    isListening,
    startListening,
    stopListening,
    transcript: recognizedText,
    isSupported
  } = useSpeechRecognition({
    onResult: (result) => {
      setTranscript(result);
    },
    onEnd: () => {
      console.log("Speech recognition ended");
    }
  });

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error);
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Set up audio context for visualization
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        
        // Cancel any ongoing animation
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        
        // Close tracks
        stream.getTracks().forEach(track => track.stop());
        
        // Use Groq Whisper for transcription
        if (audioBlob.size > 0) {
          try {
            setIsTranscribing(true);
            const transcribedText = await transcribeAudioGroq(audioBlob);
            setTranscript(transcribedText);
            setIsTranscribing(false);
          } catch (error) {
            console.error('Transcription error:', error);
            toast({
              title: "Transcription failed",
              description: "Could not transcribe audio. Please try again.",
              variant: "destructive"
            });
            setIsTranscribing(false);
          }
        }
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      // Start visualization
      visualizeAudio();
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Microphone access denied",
        description: "Please enable microphone access to use voice features.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const visualizeAudio = () => {
    if (!analyserRef.current || !audioContextRef.current) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const updateVisualization = () => {
      if (!analyserRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Take a sample of the data for visualization
      const visualData = Array.from({ length: 10 }, (_, i) => {
        const index = Math.floor(i * (bufferLength / 10));
        return dataArray[index] / 255; // Normalize to 0-1
      });
      
      setAudioVisualization(visualData);
      animationFrameRef.current = requestAnimationFrame(updateVisualization);
    };
    
    updateVisualization();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className={`relative ${isRecording ? 'bg-red-100 dark:bg-red-900' : ''}`}
        >
          {isRecording ? <MicOff className="h-5 w-5 text-red-500" /> : <Mic className="h-5 w-5" />}
          {isRecording && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Voice conversation</h4>
            <Button variant="ghost" size="icon" onClick={() => setAudioVisualization([])}>
              <BarChart3 className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Audio visualization */}
          {audioVisualization.length > 0 && (
            <div className="flex items-end justify-center h-12 gap-1 my-2">
              {audioVisualization.map((level, idx) => (
                <div 
                  key={idx}
                  className="w-1.5 bg-purple-500 rounded-full"
                  style={{ 
                    height: `${Math.max(15, level * 100)}%`,
                    opacity: level * 0.8 + 0.2
                  }}
                ></div>
              ))}
            </div>
          )}
          
          {/* Transcript */}
          {(transcript || isTranscribing) && (
            <div className="rounded-md bg-muted p-3">
              {isTranscribing ? (
                <div className="flex items-center gap-2">
                  <div className="animate-pulse">Transcribing audio...</div>
                </div>
              ) : (
                <p className="text-sm">{transcript}</p>
              )}
            </div>
          )}
          
          {/* Controls */}
          <div className="flex justify-center gap-2">
            <Button 
              onClick={isRecording ? stopRecording : startRecording}
              variant={isRecording ? "destructive" : "default"}
              className="w-full"
            >
              {isRecording ? "Stop Recording" : "Start Recording"}
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            Using Groq's Whisper integration for high-quality transcription
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default VoiceConversationPanel;
