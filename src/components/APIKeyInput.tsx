
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  hasOpenAIKey, 
  saveOpenAIKey,
  hasGroqKey,
  saveGroqKey
} from '@/integrations/openai/client';
import { useToast } from '@/components/ui/use-toast';
import { Key } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface APIKeyInputProps {
  onKeySaved?: () => void;
}

const APIKeyInput: React.FC<APIKeyInputProps> = ({ onKeySaved }) => {
  const [openaiKey, setOpenaiKey] = useState('');
  const [groqKey, setGroqKey] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('openai');
  const { toast } = useToast();

  const handleSaveOpenAIKey = () => {
    if (!openaiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your OpenAI API key",
        variant: "destructive",
      });
      return;
    }

    saveOpenAIKey(openaiKey);
    setOpenaiKey('');
    
    toast({
      title: "OpenAI API Key Saved",
      description: "Your API key has been saved successfully",
    });
    
    if (onKeySaved) {
      onKeySaved();
    }
  };
  
  const handleSaveGroqKey = () => {
    if (!groqKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your Groq API key",
        variant: "destructive",
      });
      return;
    }

    saveGroqKey(groqKey);
    setGroqKey('');
    
    toast({
      title: "Groq API Key Saved",
      description: "Your Groq API key has been saved successfully",
    });
    
    if (onKeySaved) {
      onKeySaved();
    }
  };

  return (
    <div className="bg-muted/50 p-4 rounded-lg mb-4">
      <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
        <Key className="h-5 w-5" />
        API Keys
      </h3>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="openai">OpenAI</TabsTrigger>
          <TabsTrigger value="groq">Groq</TabsTrigger>
        </TabsList>
        
        <TabsContent value="openai">
          <div className="text-sm mb-3 text-muted-foreground">
            {hasOpenAIKey() 
              ? "OpenAI API key is set. You can update it if needed." 
              : "Enter your OpenAI API key to use GPT models."}
          </div>
          
          <div className="flex gap-2">
            <Input
              type={isVisible ? "text" : "password"}
              placeholder="Enter your OpenAI API key"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              className="flex-1"
            />
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsVisible(!isVisible)}
            >
              {isVisible ? "Hide" : "Show"}
            </Button>
            <Button onClick={handleSaveOpenAIKey}>Save Key</Button>
          </div>
          
          <div className="mt-2 text-xs text-muted-foreground">
            Don't have an API key? <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Get one here</a>
          </div>
        </TabsContent>
        
        <TabsContent value="groq">
          <div className="text-sm mb-3 text-muted-foreground">
            {hasGroqKey() 
              ? "Groq API key is set. You can update it if needed." 
              : "Enter your Groq API key to use Llama and Mixtral models."}
          </div>
          
          <div className="flex gap-2">
            <Input
              type={isVisible ? "text" : "password"}
              placeholder="Enter your Groq API key"
              value={groqKey}
              onChange={(e) => setGroqKey(e.target.value)}
              className="flex-1"
            />
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsVisible(!isVisible)}
            >
              {isVisible ? "Hide" : "Show"}
            </Button>
            <Button onClick={handleSaveGroqKey}>Save Key</Button>
          </div>
          
          <div className="mt-2 text-xs text-muted-foreground">
            Don't have an API key? <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Get one here</a>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default APIKeyInput;
