
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Mic, Settings, Volume2, VolumeX } from 'lucide-react';
import VoiceConversation from '../VoiceConversation';
import { toast } from 'sonner';
import { useChat } from '@/hooks/useChat';

interface VoiceConversationPanelProps {
  elevenlabsApiKey?: string;
  agentId?: string;
}

const VoiceConversationPanel: React.FC<VoiceConversationPanelProps> = ({
  elevenlabsApiKey = "sk-fd35e9a66288e0ceeca9e348f5506815764ce9c29da1d8b6",
  agentId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { sendMessage } = useChat();
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  
  // Handle transcript from voice input
  const handleTranscriptComplete = async (transcript: string) => {
    try {
      // Send transcript to chat
      if (transcript.trim() && sendMessage) {
        await sendMessage(transcript);
        toast.success('Voice message sent');
      }
    } catch (error) {
      console.error('Failed to send voice message:', error);
      toast.error('Failed to send voice message. Please try again.');
    }
  };
  
  // Handle AI response
  const handleAIResponseReceived = (response: string) => {
    console.log('AI response received:', response);
  };
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setIsOpen(true)}
          >
            <Mic className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Voice Chat</span>
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Voice Conversation</DialogTitle>
            <DialogDescription>
              Talk with the AI assistant using your voice. Click Start Conversation to begin.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              ElevenLabs Voice
            </Badge>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
              className="gap-1.5"
            >
              {isVoiceEnabled ? (
                <>
                  <Volume2 className="h-4 w-4" />
                  <span className="text-xs">Mute</span>
                </>
              ) : (
                <>
                  <VolumeX className="h-4 w-4" />
                  <span className="text-xs">Unmute</span>
                </>
              )}
            </Button>
          </div>
          
          <Separator />
          
          <VoiceConversation 
            onTranscriptComplete={handleTranscriptComplete}
            onAIResponseReceived={handleAIResponseReceived}
            apiKey={elevenlabsApiKey}
            agentId={agentId}
          />
          
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            <p>Voice conversation powered by ElevenLabs. Your voice data is processed securely.</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VoiceConversationPanel;
