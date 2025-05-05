
import { hasGroqKey } from '@/integrations/groq/client';
import { toast } from 'sonner';

export const checkApiKeyForModel = (model: string): boolean => {
  const groqModels = [
    'llama3-8b-8192',
    'llama3-70b-8192',
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
    'gemma2-9b-it',
    'deepseek-r1-distill-llama-70b',
    'compound-beta',
    'compound-beta-mini'
  ];
  
  const isGroqModel = groqModels.includes(model);
  
  if (isGroqModel && !hasGroqKey()) {
    toast.error('Please configure your Groq API key to use this model');
    return false;
  }
  
  return true;
};

export const getAvailableModels = (): { id: string, name: string, provider: string }[] => {
  return [
    { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', provider: 'groq' },
    { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B', provider: 'groq' },
    { id: 'gemma2-9b-it', name: 'Gemma 2 9B', provider: 'groq' },
    { id: 'compound-beta', name: 'Compound (Beta)', provider: 'groq' },
    { id: 'compound-beta-mini', name: 'Compound Mini (Beta)', provider: 'groq' }
  ];
};
