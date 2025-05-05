
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { hasGroqKey, saveGroqKey } from '@/integrations/groq/client';
import { toast } from 'sonner';

interface ApiKeyInputProps {
  onKeySaved: () => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onKeySaved }) => {
  const [groqKey, setGroqKey] = useState<string>('');
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [keyStatus, setKeyStatus] = useState<'checking' | 'missing' | 'present'>('checking');

  // Check if API key exists on mount
  useEffect(() => {
    const checkKey = () => {
      const hasKey = hasGroqKey();
      setKeyStatus(hasKey ? 'present' : 'missing');
    };
    
    checkKey();
  }, []);

  const handleSaveGroqKey = () => {
    if (!groqKey.trim()) {
      toast.error('Please enter a valid API key');
      return;
    }

    try {
      saveGroqKey(groqKey);
      setKeyStatus('present');
      toast.success('API key saved successfully');
      onKeySaved();
    } catch (error) {
      console.error('Error saving API key:', error);
      toast.error('Failed to save API key');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-4 mt-4 p-4 neural-glass rounded-lg shadow-neural"
    >
      <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-medium mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        </svg>
        {keyStatus === 'present' ? 'Update Groq API Key' : 'Groq API Key Required'}
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        {keyStatus === 'present' 
          ? 'Your Groq API key is configured. You can update it if needed.' 
          : 'To use Groq models, please enter your API key. You can get one from'}
        {keyStatus === 'missing' && (
          <a 
            href="https://console.groq.com/keys" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 ml-1 underline"
          >
            Groq Console
          </a>
        )}
        .
      </p>
      
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
          <Button 
            onClick={handleSaveGroqKey} 
            className="bg-neural-gradient-blue hover:opacity-90 transition-opacity"
          >
            Save Key
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ApiKeyInput;
