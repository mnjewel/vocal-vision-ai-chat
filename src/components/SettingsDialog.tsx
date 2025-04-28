
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings } from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import ModelSelector from './ModelSelector';

const SettingsDialog = () => {
  const {
    autoSaveMessages,
    defaultModel,
    showAgentTools,
    setAutoSaveMessages,
    setDefaultModel,
    setShowAgentTools,
  } = useSettingsStore();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Chat Settings</DialogTitle>
          <DialogDescription>
            Configure your chat preferences. These settings will be saved automatically.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-save">Auto-save messages</Label>
            <Switch
              id="auto-save"
              checked={autoSaveMessages}
              onCheckedChange={setAutoSaveMessages}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="show-agent-tools">Show agent tools</Label>
            <Switch
              id="show-agent-tools"
              checked={showAgentTools}
              onCheckedChange={setShowAgentTools}
            />
          </div>
          <div className="space-y-2">
            <Label>Default Model</Label>
            <ModelSelector
              selectedModel={defaultModel}
              onSelectModel={setDefaultModel}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
