
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  defaultModel: string;
  defaultApiTab: string;
  autoSaveMessages: boolean;
  useDarkMode: boolean;
  groqApiKey: string | null;
  openaiApiKey: string | null;
  elevenlabsApiKey: string | null;
  elevenlabsVoiceId: string;
  showFollowupSuggestions: boolean;
  enableTextToSpeech: boolean;
  preferElevenLabs: boolean;
  showAgentTools: boolean;
  
  setDefaultModel: (model: string) => void;
  setDefaultApiTab: (tab: string) => void;
  setAutoSaveMessages: (save: boolean) => void;
  setUseDarkMode: (use: boolean) => void;
  setGroqApiKey: (key: string | null) => void;
  setOpenaiApiKey: (key: string | null) => void;
  setElevenlabsApiKey: (key: string | null) => void;
  setElevenlabsVoiceId: (id: string) => void;
  setShowFollowupSuggestions: (show: boolean) => void;
  setEnableTextToSpeech: (enable: boolean) => void;
  setPreferElevenLabs: (prefer: boolean) => void;
  setShowAgentTools: (show: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      defaultModel: 'llama-3.3-70b-versatile',
      defaultApiTab: 'groq',
      autoSaveMessages: true,
      useDarkMode: true,
      groqApiKey: null,
      openaiApiKey: null,
      elevenlabsApiKey: null,
      elevenlabsVoiceId: 'EXAVITQu4vr4xnSDxMaL', // Default to Sarah voice
      showFollowupSuggestions: true,
      enableTextToSpeech: true,
      preferElevenLabs: false,
      showAgentTools: false,

      setDefaultModel: (model) => set({ defaultModel: model }),
      setDefaultApiTab: (tab) => set({ defaultApiTab: tab }),
      setAutoSaveMessages: (save) => set({ autoSaveMessages: save }),
      setUseDarkMode: (use) => set({ useDarkMode: use }),
      setGroqApiKey: (key) => set({ groqApiKey: key }),
      setOpenaiApiKey: (key) => set({ openaiApiKey: key }),
      setElevenlabsApiKey: (key) => set({ elevenlabsApiKey: key }),
      setElevenlabsVoiceId: (id) => set({ elevenlabsVoiceId: id }),
      setShowFollowupSuggestions: (show) => set({ showFollowupSuggestions: show }),
      setEnableTextToSpeech: (enable) => set({ enableTextToSpeech: enable }),
      setPreferElevenLabs: (prefer) => set({ preferElevenLabs: prefer }),
      setShowAgentTools: (show) => set({ showAgentTools: show }),
    }),
    {
      name: 'neural-chat-settings',
    }
  )
);
