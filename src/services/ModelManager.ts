
import { getAvailableGroqModels } from '@/integrations/groq/service';

export interface ModelCapability {
  id: string;
  name: string;
  description: string;
  icon: string;
  requiresModel: string[];
  isAvailable: (model: string) => boolean;
}

export interface ModelPersona {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  suitableModels: string[];
}

export const MODEL_CAPABILITIES: ModelCapability[] = [
  {
    id: 'web_search',
    name: 'Web Search',
    description: 'Can search the web for current information',
    icon: 'search',
    requiresModel: ['compound-beta', 'compound-beta-mini'],
    isAvailable: (model: string) => ['compound-beta', 'compound-beta-mini'].includes(model)
  },
  {
    id: 'code_execution',
    name: 'Code Execution',
    description: 'Can run and analyze code',
    icon: 'code',
    requiresModel: ['compound-beta', 'compound-beta-mini'],
    isAvailable: (model: string) => ['compound-beta', 'compound-beta-mini'].includes(model)
  },
  {
    id: 'long_context',
    name: 'Long Context',
    description: 'Handles extended context windows',
    icon: 'file-text',
    requiresModel: [
      'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant',
      'gemma2-9b-it',
      'deepseek-r1-distill-llama-70b'
    ],
    isAvailable: (model: string) => [
      'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant',
      'gemma2-9b-it',
      'deepseek-r1-distill-llama-70b'
    ].includes(model)
  }
];

export const MODEL_PERSONAS: ModelPersona[] = [
  {
    id: 'default',
    name: 'Default Assistant',
    description: 'General-purpose AI assistant',
    systemPrompt: 'You are a helpful, friendly AI assistant. Answer questions thoroughly and accurately.',
    suitableModels: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'llama3-70b-8192', 'llama3-8b-8192']
  },
  {
    id: 'researcher',
    name: 'Research Assistant',
    description: 'Specialized in academic research and information analysis',
    systemPrompt: 'You are a research assistant specialized in analyzing information and providing well-referenced answers. Prioritize accuracy, depth, and citing reliable sources when possible.',
    suitableModels: ['llama-3.3-70b-versatile', 'compound-beta', 'deepseek-r1-distill-llama-70b']
  },
  {
    id: 'coder',
    name: 'Code Assistant',
    description: 'Specialized in programming and software development',
    systemPrompt: 'You are a coding assistant specialized in helping with programming tasks. Provide clear, well-documented code examples and explanations. Prioritize correctness, readability, and best practices.',
    suitableModels: ['compound-beta', 'compound-beta-mini', 'llama-3.3-70b-versatile']
  },
  {
    id: 'analyst',
    name: 'Data Analyst',
    description: 'Specialized in data interpretation and visualization',
    systemPrompt: 'You are a data analysis assistant specialized in interpreting, explaining, and visualizing data. Help users understand patterns, draw insights, and make data-driven decisions.',
    suitableModels: ['compound-beta', 'llama-3.3-70b-versatile']
  }
];

class ModelManagerService {
  getSystemPrompt(modelId: string, personaId: string = 'default'): string {
    // Find the requested persona or fall back to default
    const persona = MODEL_PERSONAS.find(p => p.id === personaId) || MODEL_PERSONAS.find(p => p.id === 'default')!;

    // Add model-specific capabilities to the system prompt
    let systemPrompt = persona.systemPrompt;

    // For agentic models, add specific instructions
    if (['compound-beta', 'compound-beta-mini'].includes(modelId)) {
      systemPrompt += '\n\nYou have access to the web search and code execution tools. Use them when necessary to provide the most accurate and up-to-date information.';
    }

    // For specialized models, highlight their strengths
    if (modelId === 'llama-3.3-70b-versatile') {
      systemPrompt += '\n\nYou have access to an expanded context window. Use this capability to provide comprehensive answers.';
    }

    return systemPrompt;
  }

  getCapabilitiesForModel(modelId: string): ModelCapability[] {
    return MODEL_CAPABILITIES.filter(capability => capability.isAvailable(modelId));
  }

  isPersonaSuitableForModel(personaId: string, modelId: string): boolean {
    const persona = MODEL_PERSONAS.find(p => p.id === personaId);
    if (!persona) return false;
    return persona.suitableModels.includes(modelId);
  }

  getAvailablePersonasForModel(modelId: string): ModelPersona[] {
    const suitablePersonas = MODEL_PERSONAS.filter(persona => persona.suitableModels.includes(modelId));

    // Always include the default persona if no suitable personas are found
    if (suitablePersonas.length === 0) {
      const defaultPersona = MODEL_PERSONAS.find(p => p.id === 'default');
      if (defaultPersona) {
        return [defaultPersona];
      }
    }

    return suitablePersonas;
  }

  getModelById(modelId: string) {
    return getAvailableGroqModels().find(model => model.id === modelId);
  }
}

export const ModelManager = new ModelManagerService();
