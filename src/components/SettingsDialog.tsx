
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SettingsDialog = () => {
  return (
    <Button variant="ghost" size="sm" className="h-8 gap-1.5 opacity-70 hover:opacity-100">
      <Settings className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Settings</span>
    </Button>
  );
};

export default SettingsDialog;
