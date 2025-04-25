
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { hasOpenAIKey, saveOpenAIKey } from '@/integrations/openai/client';
import { useToast } from '@/components/ui/use-toast';
import { Key } from 'lucide-react';

interface APIKeyInputProps {
  onKeySaved?: () => void;
}

const APIKeyInput: React.FC<APIKeyInputProps> = ({ onKeySaved }) => {
  const [apiKey, setApiKey] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const { toast } = useToast();

  const handleSaveKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your OpenAI API key",
        variant: "destructive",
      });
      return;
    }

    saveOpenAIKey(apiKey);
    setApiKey('');
    
    toast({
      title: "API Key Saved",
      description: "Your API key has been saved successfully",
    });
    
    if (onKeySaved) {
      onKeySaved();
    }
  };

  return (
    <div className="bg-muted/50 p-4 rounded-lg mb-4">
      <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
        <Key className="h-5 w-5" />
        OpenAI API Key
      </h3>
      <div className="text-sm mb-3 text-muted-foreground">
        {hasOpenAIKey() 
          ? "API key is set. You can update it if needed." 
          : "Enter your OpenAI API key to use the chat functionality."}
      </div>
      
      <div className="flex gap-2">
        <Input
          type={isVisible ? "text" : "password"}
          placeholder="Enter your OpenAI API key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="flex-1"
        />
        <Button
          variant="outline"
          type="button"
          onClick={() => setIsVisible(!isVisible)}
        >
          {isVisible ? "Hide" : "Show"}
        </Button>
        <Button onClick={handleSaveKey}>Save Key</Button>
      </div>
      
      <div className="mt-2 text-xs text-muted-foreground">
        Don't have an API key? <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Get one here</a>
      </div>
    </div>
  );
};

export default APIKeyInput;
