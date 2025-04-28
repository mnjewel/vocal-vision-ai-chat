
import { getGroqConfig, hasGroqKey } from '../openai/client';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface GroqCompletionParams {
  messages: Message[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export const getAvailableGroqModels = () => [
  { id: 'llama3-8b-8192', name: 'Llama-3 8B' },
  { id: 'llama3-70b-8192', name: 'Llama-3 70B' },
  { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B' },
];

export async function createGroqChatCompletion(params: GroqCompletionParams): Promise<string> {
  const config = getGroqConfig();
  
  if (!hasGroqKey()) {
    throw new Error('Groq API key not configured');
  }
  
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: params.model || 'llama3-8b-8192',
        messages: params.messages,
        temperature: params.temperature || 0.7,
        max_tokens: params.maxTokens || 1000,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to get response from Groq');
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling Groq API:', error);
    throw error;
  }
}
