export interface ModelCapability {
  id: string;
  name: string;
  description: string;
}

export interface ModelPersona {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  compatibleModels: string[];
}

export interface Model {
  id: string;
  name: string;
  provider: 'groq' | 'openai' | 'anthropic' | 'other';
  contextWindow: number;
  capabilities: string[];
  supportsImages: boolean;
  recommended?: boolean;
}
