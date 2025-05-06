

import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Export the type that was previously only defined locally
export interface GroqChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface GroqChatCompletionRequest {
  model: string;
  messages: GroqChatMessage[];
  temperature?: number;
  max_tokens?: number;
}

export const createGroqChatCompletion = async (request: GroqChatCompletionRequest) => {
  try {
    console.log('Sending request to Groq API via edge function');
    console.log('Model:', request.model);
    console.log('Messages count:', request.messages.length);
    
    // Use the edge function to make the API call
    const { data, error } = await supabase.functions.invoke('chat', {
      body: {
        messages: request.messages,
        model: request.model,
        temperature: request.temperature || 0.7,
        max_tokens: request.max_tokens || 1024,
      }
    });

    if (error) {
      console.error('Error calling chat edge function:', error);
      toast.error('Error calling AI model. Please try again.');
      throw new Error(`Edge function error: ${error.message}`);
    }

    if (!data) {
      console.error('No data returned from edge function');
      toast.error('No response from AI model. Please try again.');
      throw new Error('No data returned from edge function');
    }

    console.log('Received response from edge function:', data);
    return data;
  } catch (error) {
    console.error('Error in createGroqChatCompletion:', error);
    toast.error('Failed to generate response. Please try again.');
    throw error;
  }
};

