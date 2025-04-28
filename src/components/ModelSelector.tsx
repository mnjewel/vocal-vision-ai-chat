
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getAvailableModels } from '@/integrations/openai/service';
import { getAvailableGroqModels } from '@/integrations/groq/service';
import { hasGroqKey, hasOpenAIKey } from '@/integrations/openai/client';

interface ModelSelectorProps {
  selectedModel: string;
  onSelectModel: (model: string) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onSelectModel,
}) => {
  const openaiModels = getAvailableModels();
  const groqModels = getAvailableGroqModels();
  
  const handleModelChange = (value: string) => {
    onSelectModel(value);
  };

  const hasOpenAI = hasOpenAIKey();
  const hasGroq = hasGroqKey();

  return (
    <Select value={selectedModel} onValueChange={handleModelChange}>
      <SelectTrigger className="w-[180px] h-8">
        <SelectValue placeholder="Select a model" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel className="flex items-center justify-between">
            <span>OpenAI Models</span>
            {!hasOpenAI && <span className="text-xs text-amber-500">(Key required)</span>}
          </SelectLabel>
          {openaiModels.map((model) => (
            <SelectItem 
              key={model.id} 
              value={model.id}
              disabled={!hasOpenAI}
            >
              {model.name}
            </SelectItem>
          ))}
        </SelectGroup>
        <SelectGroup>
          <SelectLabel className="flex items-center justify-between mt-2">
            <span>Groq Models</span>
            {!hasGroq && <span className="text-xs text-amber-500">(Key required)</span>}
          </SelectLabel>
          {groqModels.map((model) => (
            <SelectItem 
              key={model.id} 
              value={model.id}
              disabled={!hasGroq}
            >
              {model.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default ModelSelector;
