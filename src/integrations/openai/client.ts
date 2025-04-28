
// OpenAI API client configuration

// We'll use environment variable or let user input it in the UI
const getOpenAIKey = (): string => {
  // In production, this should be fetched from an edge function
  const storedKey = localStorage.getItem('openai_api_key');
  return storedKey || '';
};

export const hasOpenAIKey = (): boolean => {
  const key = getOpenAIKey();
  return key !== null && key !== '';
};

export const getOpenAIConfig = () => {
  return {
    apiKey: getOpenAIKey(),
    baseURL: 'https://api.openai.com/v1',
  };
};

export const saveOpenAIKey = (key: string): void => {
  localStorage.setItem('openai_api_key', key);
};

export const removeOpenAIKey = (): void => {
  localStorage.removeItem('openai_api_key');
};

// Groq API key management
const getGroqKey = (): string => {
  const storedKey = localStorage.getItem('groq_api_key');
  return storedKey || '';
};

export const hasGroqKey = (): boolean => {
  const key = getGroqKey();
  return key !== null && key !== '';
};

export const getGroqConfig = () => {
  return {
    apiKey: getGroqKey(),
    baseURL: 'https://api.groq.com/openai/v1',
  };
};

export const saveGroqKey = (key: string): void => {
  localStorage.setItem('groq_api_key', key);
};

export const removeGroqKey = (): void => {
  localStorage.removeItem('groq_api_key');
};
