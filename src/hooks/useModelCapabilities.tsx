import { useCallback } from 'react';
import { ModelManager } from '@/services/ModelManager';
import { ModelCapability } from '@/types/models';

export const useModelCapabilities = () => {
  // Get capabilities for a model
  const getCapabilitiesForModel = useCallback((model: string): ModelCapability[] => {
    return ModelManager.getCapabilitiesForModel(model);
  }, []);

  // Check if a model is agentic (can search web, execute code, etc.)
  const isAgentic = useCallback((model: string): boolean => {
    return ['compound-beta', 'compound-beta-mini'].includes(model);
  }, []);

  // Get context window size for a model
  const getContextWindowSize = useCallback((model: string): number => {
    return ModelManager.getContextWindowSize(model);
  }, []);

  // Check if a model supports image input
  const supportsImageInput = useCallback((model: string): boolean => {
    return ModelManager.supportsImageInput(model);
  }, []);

  // Get all available models
  const getAllModels = useCallback(() => {
    return ModelManager.getAllModels();
  }, []);

  // Get recommended models
  const getRecommendedModels = useCallback(() => {
    return ModelManager.getRecommendedModels();
  }, []);

  return {
    getCapabilitiesForModel,
    isAgentic,
    getContextWindowSize,
    supportsImageInput,
    getAllModels,
    getRecommendedModels
  };
};

export default useModelCapabilities;
