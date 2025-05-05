import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { popularVoices } from '@/integrations/elevenlabs/service';

const SettingsDialogEnhanced = () => {
  const {
    defaultModel,
    autoSaveMessages,
    showFollowupSuggestions,
    enableTextToSpeech,
    preferElevenLabs,
    elevenlabsVoiceId,
    setDefaultModel,
    setAutoSaveMessages,
    setShowFollowupSuggestions,
    setEnableTextToSpeech,
    setPreferElevenLabs,
    setElevenlabsVoiceId,
  } = useSettingsStore();

  const defaultModels = [
    { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile' },
    { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant' },
    { id: 'gemma2-9b-it', name: 'Gemma 2 9B' },
    { id: 'compound-beta', name: 'Compound Beta (Agentic)' },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-9 w-9"
          title="Settings"
        >
          <Settings className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your chat experience preferences
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="default-model">Default Model</Label>
            <Select
              value={defaultModel}
              onValueChange={setDefaultModel}
            >
              <SelectTrigger id="default-model">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {defaultModels.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-save">Auto-save Messages</Label>
              <p className="text-muted-foreground text-sm">
                Save messages to database when logged in
              </p>
            </div>
            <Switch
              id="auto-save"
              checked={autoSaveMessages}
              onCheckedChange={setAutoSaveMessages}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="follow-up">Show Follow-up Suggestions</Label>
              <p className="text-muted-foreground text-sm">
                Display suggested follow-up questions
              </p>
            </div>
            <Switch
              id="follow-up"
              checked={showFollowupSuggestions}
              onCheckedChange={setShowFollowupSuggestions}
            />
          </div>

          <Separator />
          
          {/* Text-to-Speech Settings */}
          <h3 className="font-medium">Speech Settings</h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="text-to-speech">Enable Text-to-Speech</Label>
              <p className="text-muted-foreground text-sm">
                Read AI responses aloud
              </p>
            </div>
            <Switch
              id="text-to-speech"
              checked={enableTextToSpeech}
              onCheckedChange={setEnableTextToSpeech}
            />
          </div>
          
          {enableTextToSpeech && (
            <>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="prefer-eleven-labs">Prefer ElevenLabs</Label>
                  <p className="text-muted-foreground text-sm">
                    Use ElevenLabs instead of browser TTS
                  </p>
                </div>
                <Switch
                  id="prefer-eleven-labs"
                  checked={preferElevenLabs}
                  onCheckedChange={setPreferElevenLabs}
                />
              </div>
              
              {preferElevenLabs && (
                <div className="grid gap-2">
                  <Label htmlFor="elevenlabs-voice">ElevenLabs Voice</Label>
                  <Select
                    value={elevenlabsVoiceId}
                    onValueChange={setElevenlabsVoiceId}
                  >
                    <SelectTrigger id="elevenlabs-voice">
                      <SelectValue placeholder="Select a voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {popularVoices.map((voice) => (
                        <SelectItem key={voice.id} value={voice.id}>
                          {voice.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialogEnhanced;
