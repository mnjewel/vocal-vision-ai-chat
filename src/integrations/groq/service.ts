
import { OpenAI } from 'openai';
import { getGroqConfig, hasGroqKey } from './client';
import { toast } from 'sonner';

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
    // Check if API key is available
    if (!hasGroqKey()) {
      throw new Error('Groq API key not configured');
    }
    
    // Get API key
    const { apiKey } = getGroqConfig();
    
    // Create OpenAI client with base URL for Groq
    const groq = new OpenAI({
      apiKey,
      baseURL: 'https://api.groq.com/openai/v1',
    });
    
    // Call ChatCompletion API
    const response = await groq.chat.completions.create({
      model: request.model,
      messages: request.messages,
      temperature: request.temperature || 0.7,
      max_tokens: request.max_tokens || 1024,
    });
    
    // Return the response
    if (response.choices && response.choices.length > 0 && response.choices[0].message) {
      return response.choices[0].message;
    }
    
    throw new Error('Invalid response from Groq API');
  } catch (error) {
    console.error('Error calling Groq API:', error);
    toast.error('Error calling AI model. Please check your API key and try again.');
    throw error;
  }
};
