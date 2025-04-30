
// Store key in localStorage
const GROQ_API_KEY_STORAGE = 'groq_api_key';

interface GroqConfig {
  apiKey: string;
}

export const getGroqConfig = (): GroqConfig => {
  const apiKey = localStorage.getItem(GROQ_API_KEY_STORAGE);
  
  if (!apiKey) {
    throw new Error('Groq API key not configured');
  }
  
  return {
    apiKey,
  };
};

export const hasGroqKey = (): boolean => {
  return !!localStorage.getItem(GROQ_API_KEY_STORAGE);
};

export const saveGroqKey = (apiKey: string): void => {
  localStorage.setItem(GROQ_API_KEY_STORAGE, apiKey);
};

export const removeGroqKey = (): void => {
  localStorage.removeItem(GROQ_API_KEY_STORAGE);
};
