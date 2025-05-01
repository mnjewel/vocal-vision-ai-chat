
import { toast } from 'sonner';

// Default API key - should be replaced with user's key from environment
const DEFAULT_API_KEY = "sk-fd35e9a66288e0ceeca9e348f5506815764ce9c29da1d8b6";

// ElevenLabs API wrapper
export class ElevenLabsService {
  private apiKey: string;
  private baseUrl: string = 'https://api.elevenlabs.io/v1';
  
  constructor(apiKey?: string) {
    this.apiKey = apiKey || DEFAULT_API_KEY;
  }
  
  // Set or update the API key
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }
  
  // Get all available voices
  async getVoices() {
    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        method: 'GET',
        headers: {
          'xi-api-key': this.apiKey,
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch voices');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching voices:', error);
      throw error;
    }
  }
  
  // Text-to-Speech conversion
  async textToSpeech(text: string, voiceId: string = "EXAVITQu4vr4xnSDxMaL") {
    try {
      const response = await fetch(`${this.baseUrl}/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          }
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Text-to-speech conversion failed');
      }
      
      return await response.blob();
    } catch (error) {
      console.error('Error converting text to speech:', error);
      throw error;
    }
  }
  
  // Create a new conversation agent
  async createAgent(config: any) {
    try {
      const response = await fetch(`${this.baseUrl}/convai/agents/create`, {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create agent');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating agent:', error);
      throw error;
    }
  }
  
  // Get signed URL for establishing a conversation
  async getSignedUrl(agentId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/convai/conversation/get_signed_url?agent_id=${agentId}`, {
        method: 'GET',
        headers: {
          'xi-api-key': this.apiKey,
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to get signed URL');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting signed URL:', error);
      throw error;
    }
  }
}

// Voice list for easy access
export const popularVoices = [
  { id: "9BWtsMINqrJLrRacOk9x", name: "Aria" },
  { id: "CwhRBWXzGAHq8TQ4Fs17", name: "Roger" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah" },
  { id: "FGY2WhTYpPnrIDTdsKH5", name: "Laura" },
  { id: "IKne3meq5aSn9XLyUdCD", name: "Charlie" },
  { id: "JBFqnCBsd6RMkjVDRZzb", name: "George" },
  { id: "N2lVS1w4EtoT3dr4eOWO", name: "Callum" },
  { id: "SAz9YHcvj6GT2YYXdXww", name: "River" }
];

// Create default service instance
export const elevenlabsService = new ElevenLabsService();

// Helper to speak text using the service
export const speakText = async (text: string, voiceId?: string): Promise<string | null> => {
  try {
    const audioBlob = await elevenlabsService.textToSpeech(text, voiceId);
    const audioUrl = URL.createObjectURL(audioBlob);
    
    // Create and play audio element
    const audio = new Audio(audioUrl);
    audio.play();
    
    return audioUrl;
  } catch (error) {
    console.error('Failed to speak text:', error);
    toast.error('Failed to generate speech. Please check your API key.');
    return null;
  }
};
