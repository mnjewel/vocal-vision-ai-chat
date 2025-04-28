
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  autoSaveMessages: boolean;
  defaultModel: string;
  showAgentTools: boolean;
  setAutoSaveMessages: (autoSave: boolean) => void;
  setDefaultModel: (model: string) => void;
  setShowAgentTools: (show: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      autoSaveMessages: true,
      defaultModel: 'llama-3.3-70b-versatile',
      showAgentTools: true,
      setAutoSaveMessages: (autoSave) => set({ autoSaveMessages: autoSave }),
      setDefaultModel: (model) => set({ defaultModel: model }),
      setShowAgentTools: (show) => set({ showAgentTools: show }),
    }),
    {
      name: 'chat-settings',
    }
  )
);
