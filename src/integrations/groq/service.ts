
import { getGroqConfig, hasGroqKey } from './client';

// Updated model list based on Groq's documentation
export const getAvailableGroqModels = () => [
  // Production Models
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B Versatile (128K)',
    contextWindow: 128000,
    capabilities: ['chat', 'completion']
  },
  {
    id: 'llama-3.1-8b-instant',
    name: 'Llama 3.1 8B Instant (128K)',
    contextWindow: 128000,
    capabilities: ['chat', 'completion']
  },
  {
    id: 'gemma2-9b-it',
    name: 'Gemma 2 9B',
    contextWindow: 8192,
    capabilities: ['chat', 'completion'] 
  },
  {
    id: 'llama3-70b-8192',
    name: 'Llama 3 70B (8K)',
    contextWindow: 8192,
    capabilities: ['chat', 'completion']
  },
  {
    id: 'llama3-8b-8192',
    name: 'Llama 3 8B (8K)',
    contextWindow: 8192,
    capabilities: ['chat', 'completion']
  },
  // Preview Models
  {
    id: 'deepseek-r1-distill-llama-70b',
    name: 'DeepSeek R1 Distill Llama 70B (128K)',
    contextWindow: 128000,
    capabilities: ['chat', 'completion']
  },
  // Agentic Models (Systems)
  {
    id: 'compound-beta',
    name: 'Compound Beta (Web Search & Code)',
    contextWindow: 32768,
    capabilities: ['chat', 'completion', 'search', 'code']
  },
  {
    id: 'compound-beta-mini',
    name: 'Compound Beta Mini (Fast)',
    contextWindow: 32768,
    capabilities: ['chat', 'completion', 'search']
  },
  // High-Performance Models
  {
    id: 'mixtral-8x22b-instruct',
    name: 'Mixtral 8x22B Instruct',
    contextWindow: 65536,
    capabilities: ['chat', 'completion', 'function-calling']
  },
];

interface ChatCompletionParams {
  messages: Array<{ role: string; content: string }>;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  tools?: Array<{
    type: string;
    function: {
      name: string;
      description?: string;
      parameters: Record<string, unknown>;
    }
  }>;
}

interface ChatCompletionResponse {
  content: string;
  executedTools?: any;
  functionCalls?: any;
}

export async function createGroqChatCompletion(params: ChatCompletionParams): Promise<ChatCompletionResponse> {
  const config = getGroqConfig();
  if (!hasGroqKey()) {
    throw new Error('Groq API key not configured');
  }

  const requestBody: any = {
    model: params.model || 'llama-3.1-8b-instant',
    messages: params.messages,
    temperature: params.temperature || 0.7,
    max_tokens: params.maxTokens || 1000
  };

  // Add tools if provided
  if (params.tools && params.tools.length > 0) {
    requestBody.tools = params.tools;
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to get response from Groq');
    }

    const data = await response.json();
    
    // Extract function calls if available (for agentic models)
    const functionCalls = data.choices[0].message.function_call || 
                         (data.choices[0].message.tool_calls?.map(call => call.function));
    
    // Extract executed tools if available (for agentic models)
    const executedTools = data.choices[0].message.executed_tools;
    
    return {
      content: data.choices[0].message.content,
      executedTools: executedTools || undefined,
      functionCalls: functionCalls || undefined
    };
  } catch (error) {
    console.error('Error calling Groq API:', error);
    throw error;
  }
}

// Support for streaming completions
export async function createGroqChatCompletionStream(params: ChatCompletionParams): Promise<ReadableStream> {
  const config = getGroqConfig();
  if (!hasGroqKey()) {
    throw new Error('Groq API key not configured');
  }

  const requestBody: any = {
    model: params.model || 'llama-3.1-8b-instant',
    messages: params.messages,
    temperature: params.temperature || 0.7,
    max_tokens: params.maxTokens || 1000,
    stream: true
  };

  // Add tools if provided
  if (params.tools && params.tools.length > 0) {
    requestBody.tools = params.tools;
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to get streaming response from Groq');
    }

    return response.body!;
  } catch (error) {
    console.error('Error calling Groq streaming API:', error);
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

// Function to get model capabilities
export function getModelCapabilities(modelId: string): string[] {
  const model = getAvailableGroqModels().find(m => m.id === modelId);
  return model?.capabilities || ['chat', 'completion'];
}

// Function to get model context window size
export function getModelContextWindow(modelId: string): number {
  const model = getAvailableGroqModels().find(m => m.id === modelId);
  return model?.contextWindow || 8192;
}

// Function to check if a model supports function calling
export function modelSupportsFunctionCalling(modelId: string): boolean {
  const capabilities = getModelCapabilities(modelId);
  return capabilities.includes('function-calling');
}
