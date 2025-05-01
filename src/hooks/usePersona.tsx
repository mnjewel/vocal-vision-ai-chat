
import { useState, useCallback } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { ModelManager } from '@/services/ModelManager';
import { toast } from '@/components/ui/use-toast';

export const usePersona = () => {
  // Initialize with a default persona
  const [activePersona, setActivePersona] = useState(
    useSettingsStore.getState().defaultModel ? 'default' : 'default'
  );
  
  // Get system prompt for a persona
  const getSystemPrompt = useCallback((personaId: string) => {
    return ModelManager.getSystemPrompt(personaId);
  }, []);
  
  const getAvailablePersonas = useCallback(() => {
    return ModelManager.getAvailablePersonasForModel('llama-3.3-70b-versatile');
  }, []);

  const isPersonaSuitableForModel = useCallback((personaId: string, model: string) => {
    return ModelManager.isPersonaSuitableForModel(personaId, model);
  }, []);

  const changePersona = useCallback((personaId: string) => {
    setActivePersona(personaId);
    toast({
      description: `Switched to ${ModelManager.getAvailablePersonasForModel('llama-3.3-70b-versatile').find(p => p.id === personaId)?.name} persona`,
    });
  }, []);

  const getCurrentPersona = useCallback(() => {
    return ModelManager.getAvailablePersonasForModel('llama-3.3-70b-versatile').find(p => p.id === activePersona);
  }, [activePersona]);
  
  return {
    activePersona,
    setActivePersona,
    getSystemPrompt,
    getAvailablePersonas,
    isPersonaSuitableForModel,
    changePersona,
    getCurrentPersona
  };
};

export default usePersona;
