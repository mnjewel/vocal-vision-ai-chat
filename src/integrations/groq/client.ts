
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
  try {
    // Check if localStorage is available (for SSR environments)
    if (typeof window === 'undefined' || !localStorage) return false;
    
    const key = localStorage.getItem(GROQ_API_KEY_STORAGE);
    return !!key && key.trim() !== '';
  } catch (error) {
    console.error('Error checking for Groq API key:', error);
    return false;
  }
};

export const saveGroqKey = (apiKey: string): void => {
  try {
    localStorage.setItem(GROQ_API_KEY_STORAGE, apiKey);
  } catch (error) {
    console.error('Error saving Groq API key:', error);
    throw new Error('Could not save Groq API key');
  }
};

export const removeGroqKey = (): void => {
  try {
    localStorage.removeItem(GROQ_API_KEY_STORAGE);
  } catch (error) {
    console.error('Error removing Groq API key:', error);
  }
};
