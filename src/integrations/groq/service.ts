
import { getGroqConfig, hasGroqKey } from './client';

// Updated model list based on Groq's documentation
export const getAvailableGroqModels = () => [
  // Production Models
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B Versatile (128K)'
  },
  {
    id: 'llama-3.1-8b-instant',
    name: 'Llama 3.1 8B Instant (128K)'
  },
  {
    id: 'gemma2-9b-it',
    name: 'Gemma 2 9B'
  },
  {
    id: 'llama3-70b-8192',
    name: 'Llama 3 70B (8K)'
  },
  {
    id: 'llama3-8b-8192',
    name: 'Llama 3 8B (8K)'
  },
  // Preview Models
  {
    id: 'deepseek-r1-distill-llama-70b',
    name: 'DeepSeek R1 Distill Llama 70B (128K)'
  },
  // Agentic Models (Systems)
  {
    id: 'compound-beta',
    name: 'Compound Beta (Web Search & Code)'
  },
  {
    id: 'compound-beta-mini',
    name: 'Compound Beta Mini (Fast)'
  }
];

interface ChatCompletionParams {
  messages: Array<{ role: string; content: string }>;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

interface ChatCompletionResponse {
  content: string;
  executedTools?: any;
}

export async function createGroqChatCompletion(params: ChatCompletionParams): Promise<ChatCompletionResponse> {
  const config = getGroqConfig();
  if (!hasGroqKey()) {
    throw new Error('Groq API key not configured');
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: params.model || 'llama-3.1-8b-instant',
        messages: params.messages,
        temperature: params.temperature || 0.7,
        max_tokens: params.maxTokens || 1000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to get response from Groq');
    }

    const data = await response.json();
    // Extract executed tools if available (for agentic models)
    const executedTools = data.choices[0].message.executed_tools;
    
    return {
      content: data.choices[0].message.content,
      executedTools: executedTools || undefined
    };
  } catch (error) {
    console.error('Error calling Groq API:', error);
    throw error;
  }
}

// Add support for Groq's whisper models
export async function transcribeAudioGroq(audioBlob: Blob): Promise<string> {
  const config = getGroqConfig();
  if (!hasGroqKey()) {
    throw new Error('Groq API key not configured');
  }

  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.webm');
  formData.append('model', 'whisper-large-v3');

  try {
    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to transcribe audio with Groq');
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('Error transcribing audio with Groq:', error);
    throw error;
  }
}
