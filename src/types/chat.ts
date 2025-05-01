
export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  model?: string;
  pending?: boolean;
  imageUrl?: string;
  metadata?: {
    searchResults?: any[];
    codeOutput?: string;
    annotations?: string[];
  };
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Persona {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  suitableModels: string[];
}

export interface ModelCapability {
  id: string;
  name: string;
  description: string;
  icon: string;
}
