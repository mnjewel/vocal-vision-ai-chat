
// Groq API client configuration

interface GroqConfig {
  apiKey: string | null;
}

const LOCAL_STORAGE_KEY = 'groq-api-key';

export const getGroqConfig = (): GroqConfig => {
  return {
    apiKey: localStorage.getItem(LOCAL_STORAGE_KEY),
  };
};

export const hasGroqKey = (): boolean => {
  return localStorage.getItem(LOCAL_STORAGE_KEY) !== null;
};

export const saveGroqKey = (apiKey: string): void => {
  localStorage.setItem(LOCAL_STORAGE_KEY, apiKey);
};

export const removeGroqKey = (): void => {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
};
