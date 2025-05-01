
// If this file doesn't exist yet, this will create it
import { Message } from '@/types/chat';

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

class ModelManagerService {
  private defaultModel = 'llama-3.3-70b-versatile';
  
  private modelCapabilities: Record<string, ModelCapability[]> = {
    'llama3-8b-8192': [{ id: 'text', name: 'Text', description: 'Text generation', icon: 'MessageSquare' }],
    'llama3-70b-8192': [
      { id: 'text', name: 'Text', description: 'Text generation', icon: 'MessageSquare' },
      { id: 'reasoning', name: 'Reasoning', description: 'Complex reasoning', icon: 'Brain' }
    ],
    'llama-3.3-70b-versatile': [
      { id: 'text', name: 'Text', description: 'Text generation', icon: 'MessageSquare' },
      { id: 'reasoning', name: 'Reasoning', description: 'Complex reasoning', icon: 'Brain' },
      { id: 'image', name: 'Images', description: 'Image understanding', icon: 'Image' }
    ],
    'llama-3.1-8b-instant': [{ id: 'text', name: 'Text', description: 'Text generation', icon: 'MessageSquare' }],
    'gemma2-9b-it': [{ id: 'text', name: 'Text', description: 'Text generation', icon: 'MessageSquare' }],
    'deepseek-r1-distill-llama-70b': [
      { id: 'text', name: 'Text', description: 'Text generation', icon: 'MessageSquare' },
      { id: 'coding', name: 'Coding', description: 'Code generation', icon: 'Code' }
    ],
    'compound-beta': [
      { id: 'text', name: 'Text', description: 'Text generation', icon: 'MessageSquare' },
      { id: 'search', name: 'Web Search', description: 'Web search', icon: 'Search' },
      { id: 'code', name: 'Code Execution', description: 'Can execute code', icon: 'Terminal' },
      { id: 'tool', name: 'Tool Use', description: 'Can use external tools', icon: 'Wrench' }
    ],
    'compound-beta-mini': [
      { id: 'text', name: 'Text', description: 'Text generation', icon: 'MessageSquare' },
      { id: 'search', name: 'Web Search', description: 'Web search', icon: 'Search' },
      { id: 'code', name: 'Code Execution', description: 'Can execute code', icon: 'Terminal' }
    ]
  };

  private personas: Persona[] = [
    {
      id: 'default',
      name: 'Default Assistant',
      description: 'General-purpose AI assistant',
      systemPrompt: 'You are a helpful, friendly AI assistant.',
      suitableModels: ['llama3-8b-8192', 'llama3-70b-8192', 'llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'gemma2-9b-it', 'deepseek-r1-distill-llama-70b', 'compound-beta', 'compound-beta-mini']
    },
    {
      id: 'researcher',
      name: 'Research Assistant',
      description: 'Specialized in finding and analyzing information',
      systemPrompt: 'You are a research assistant skilled at finding, analyzing, and synthesizing information.',
      suitableModels: ['llama3-70b-8192', 'llama-3.3-70b-versatile', 'compound-beta', 'compound-beta-mini']
    },
    {
      id: 'coder',
      name: 'Code Assistant',
      description: 'Specialized in programming and development',
      systemPrompt: 'You are a coding assistant skilled at writing, explaining, and debugging code.',
      suitableModels: ['deepseek-r1-distill-llama-70b', 'compound-beta', 'compound-beta-mini']
    },
    {
      id: 'analyst',
      name: 'Data Analyst',
      description: 'Specialized in analyzing and visualizing data',
      systemPrompt: 'You are a data analyst skilled at interpreting, analyzing, and visualizing data.',
      suitableModels: ['llama3-70b-8192', 'llama-3.3-70b-versatile', 'compound-beta', 'compound-beta-mini']
    }
  ];

  // Get capabilities for a specific model
  getCapabilitiesForModel(model: string): ModelCapability[] {
    return this.modelCapabilities[model] || [];
  }

  // Get all available personas for a specific model
  getAvailablePersonasForModel(model: string): Persona[] {
    return this.personas.filter(persona => persona.suitableModels.includes(model));
  }

  // Check if a persona is suitable for a model
  isPersonaSuitableForModel(personaId: string, model: string): boolean {
    const persona = this.personas.find(p => p.id === personaId);
    if (!persona) return false;
    return persona.suitableModels.includes(model);
  }

  // Check if model is agentic
  isAgentic(model: string): boolean {
    return ['compound-beta', 'compound-beta-mini'].includes(model);
  }

  // Get system prompt for a persona
  getSystemPrompt(personaId: string): string {
    const persona = this.personas.find(p => p.id === personaId);
    return persona?.systemPrompt || this.personas[0].systemPrompt;
  }

  // Added functions to fix type errors
  getContextWindowSize(model: string): number {
    const modelSizes: Record<string, number> = {
      'llama3-8b-8192': 8192,
      'llama3-70b-8192': 8192,
      'llama-3.3-70b-versatile': 8192,
      'llama-3.1-8b-instant': 4096,
      'gemma2-9b-it': 8192,
      'deepseek-r1-distill-llama-70b': 8192,
      'compound-beta': 16384,
      'compound-beta-mini': 12288
    };
    
    return modelSizes[model] || 4096;
  }

  supportsImageInput(model: string): boolean {
    return ['llama-3.3-70b-versatile', 'compound-beta', 'compound-beta-mini'].includes(model);
  }

  getAllModels(): string[] {
    return Object.keys(this.modelCapabilities);
  }

  getRecommendedModels(): string[] {
    return ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'compound-beta'];
  }
}

export const ModelManager = new ModelManagerService();
