
// OpenAI API client configuration

// We'll use environment variable or let user input it in the UI
const getOpenAIKey = (): string => {
  // In production, this should be fetched from an edge function
  const storedKey = localStorage.getItem('openai_api_key');
  return storedKey || '';
};

export const hasOpenAIKey = (): boolean => {
  return !!getOpenAIKey();
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
