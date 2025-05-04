
import { useState } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useSettingsStore } from '@/stores/settingsStore';
import { toast } from 'sonner';

const SettingsDialog = () => {
  const [open, setOpen] = useState(false);
  const { autoSaveMessages, showAgentTools, setAutoSaveMessages, setShowAgentTools } = useSettingsStore();

  const handleAutoSaveToggle = (checked: boolean) => {
    setAutoSaveMessages(checked);
    toast.success(`Auto-save messages ${checked ? 'enabled' : 'disabled'}`);
  };

  const handleAgentToolsToggle = (checked: boolean) => {
    setShowAgentTools(checked);
    toast.success(`Agent tools ${checked ? 'enabled' : 'disabled'}`);
  };

  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-8 gap-1.5 opacity-70 hover:opacity-100"
        onClick={() => setOpen(true)}
      >
        <Settings className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Settings</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-save" className="flex flex-col gap-1">
                <span>Auto-save messages</span>
                <span className="font-normal text-xs text-muted-foreground">Save messages to your account automatically</span>
              </Label>
              <Switch 
                id="auto-save" 
                checked={autoSaveMessages} 
                onCheckedChange={handleAutoSaveToggle}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="agent-tools" className="flex flex-col gap-1">
                <span>Show agent tools</span>
                <span className="font-normal text-xs text-muted-foreground">Enable advanced AI agent capabilities</span>
              </Label>
              <Switch 
                id="agent-tools" 
                checked={showAgentTools} 
                onCheckedChange={handleAgentToolsToggle}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SettingsDialog;
