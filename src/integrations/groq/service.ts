
import OpenAI from 'openai';

const groq = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

export const createGroqChatCompletion = async (
  request: any
) => {
  try {
    const response = await groq.chat.completions.create(request);
    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error('Groq API returned an empty response');
    }

    return {
      role: 'assistant',
      content: content,
    };
  } catch (error: any) {
    console.error('Groq API error:', error);
    throw new Error(
      error.message || 'Failed to generate completion from Groq API'
    );
  }
};

interface FunctionCall {
  name: string;
  arguments: string;
}

export const handleFunctionCall = async (call: FunctionCall) => {
  try {
    if (!call || !call.name) {
      console.warn('Invalid function call:', call);
      return {
        role: 'system',
        content: "Invalid function call provided."
      };
    }

    console.log(`Function call ${call.name} with args:`, call.arguments);

    // Add more function handlers here
    return {
      role: 'system',
      content: `Function ${call.name} called successfully with arguments ${call.arguments}.`
    };

  } catch (error: any) {
    console.error("Error handling function call:", error);
    return {
      role: 'system',
      content: `Error executing function ${call.name}: ${error.message}`
    };
  }
};
