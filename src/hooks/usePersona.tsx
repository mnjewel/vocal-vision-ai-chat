import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { ModelManager } from '@/services/ModelManager';

export const usePersona = () => {
  const [activePersona, setActivePersona] = useState<string>('default');

  // Get available personas for a model
  const getAvailablePersonas = useCallback((model: string) => {
    return ModelManager.getAvailablePersonasForModel(model);
  }, []);

  // Check if a persona is suitable for a model
  const isPersonaSuitableForModel = useCallback((personaId: string, model: string) => {
    return ModelManager.isPersonaSuitableForModel(personaId, model);
  }, []);

  // Get system prompt for a model and persona
  const getSystemPrompt = useCallback((model: string, personaId: string) => {
    return ModelManager.getSystemPrompt(model, personaId);
  }, []);

  // Change persona with validation
  const changePersona = useCallback((personaId: string, model: string) => {
    if (!isPersonaSuitableForModel(personaId, model)) {
      toast.error('This persona is not suitable for the selected model');
      return false;
    }
    
    setActivePersona(personaId);
    
    const personas = getAvailablePersonas(model);
    const persona = personas.find(p => p.id === personaId);
    
    if (persona) {
      toast.success(`Switched to ${persona.name} persona`);
    }
    
    return true;
  }, [getAvailablePersonas, isPersonaSuitableForModel]);

  // Get current persona
  const getCurrentPersona = useCallback((model: string) => {
    const personas = getAvailablePersonas(model);
    return personas.find(p => p.id === activePersona) || personas[0];
  }, [activePersona, getAvailablePersonas]);

  return {
    activePersona,
    setActivePersona,
    getAvailablePersonas,
    isPersonaSuitableForModel,
    getSystemPrompt,
    changePersona,
    getCurrentPersona
  };
};

export default usePersona;
