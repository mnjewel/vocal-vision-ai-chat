
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  hasGroqKey,
  saveGroqKey
} from '@/integrations/groq/client';
import { useToast } from '@/components/ui/use-toast';
import { Key } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from 'framer-motion';

interface APIKeyInputProps {
  onKeySaved?: () => void;
}

const APIKeyInput: React.FC<APIKeyInputProps> = ({ onKeySaved }) => {
  const [groqKey, setGroqKey] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('groq');
  const { toast } = useToast();
  
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
    <motion.div 
      className="backdrop-blur-md bg-white/60 dark:bg-gray-900/60 border border-gray-200/50 dark:border-gray-800/50 p-5 rounded-xl shadow-lg mb-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="h-8 w-8 rounded-full bg-neural-gradient-blue flex items-center justify-center shadow-md">
          <Key className="h-4 w-4 text-white" />
        </div>
        <h3 className="text-lg font-medium">API Keys</h3>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
        <TabsList className="mb-4 bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm">
          <TabsTrigger value="groq" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">Groq</TabsTrigger>
        </TabsList>
        
        <TabsContent value="groq" className="mt-0">
          <div className="text-sm mb-3 text-muted-foreground">
            {hasGroqKey() 
              ? "Groq API key is set. You can update it if needed." 
              : "Enter your Groq API key to use Llama and Mixtral models."}
          </div>
          
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              type={isVisible ? "text" : "password"}
              placeholder="Enter your Groq API key"
              value={groqKey}
              onChange={(e) => setGroqKey(e.target.value)}
              className="flex-1 bg-white/50 dark:bg-gray-800/50"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsVisible(!isVisible)}
                className="bg-white/80 dark:bg-gray-800/80"
              >
                {isVisible ? "Hide" : "Show"}
              </Button>
              <Button onClick={handleSaveGroqKey} className="bg-neural-gradient-blue hover:opacity-90 transition-opacity">Save Key</Button>
            </div>
          </div>
          
          <div className="mt-3 text-xs text-muted-foreground">
            Don't have an API key? <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Get one here</a>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default APIKeyInput;
