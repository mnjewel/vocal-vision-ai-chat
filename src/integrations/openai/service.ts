import { getOpenAIConfig, hasOpenAIKey, hasGroqKey } from './client';
import { createGroqChatCompletion } from '../groq/service';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatCompletionParams {
  messages: Message[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export const getAvailableModels = () => [
  { id: 'gpt-4o', name: 'GPT-4o' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
];

// Helper to check if a model is from Groq
const isGroqModel = (model: string): boolean => {
  return ['llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768'].includes(model);
};

export async function createChatCompletion(params: ChatCompletionParams): Promise<string> {
  // Use Groq service for Groq models
  if (params.model && isGroqModel(params.model)) {
    if (!hasGroqKey()) {
      throw new Error('Groq API key not configured');
    }
    
    return createGroqChatCompletion({
      messages: params.messages,
      model: params.model,
      temperature: params.temperature,
      maxTokens: params.maxTokens
    });
  }
  
  // Otherwise use OpenAI
  if (!hasOpenAIKey()) {
    throw new Error('OpenAI API key not configured');
  }
  
  const config = getOpenAIConfig();
  
  try {
    const response = await fetch(`${config.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: params.model || 'gpt-3.5-turbo',
        messages: params.messages,
        temperature: params.temperature || 0.7,
        max_tokens: params.maxTokens || 1000,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to get response from OpenAI');
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
}

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  if (!hasOpenAIKey()) {
    throw new Error('OpenAI API key not configured');
  }
  
  const config = getOpenAIConfig();
  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.webm');
  formData.append('model', 'whisper-1');
  
  try {
    const response = await fetch(`${config.baseURL}/audio/transcriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to transcribe audio');
    }
    
    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
}
