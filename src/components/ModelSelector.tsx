
import React from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getAvailableGroqModels } from '@/integrations/groq/service';
import { hasGroqKey } from '@/integrations/groq/client';

interface ModelSelectorProps {
  selectedModel: string;
  onSelectModel: (model: string) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onSelectModel,
}) => {
  const groqModels = getAvailableGroqModels();
  
  const handleModelChange = (value: string) => {
    onSelectModel(value);
  };

  const hasGroq = hasGroqKey();

  return (
    <Select value={selectedModel} onValueChange={handleModelChange}>
      <SelectTrigger className="w-[180px] h-8">
        <SelectValue placeholder="Select a model" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel className="flex items-center justify-between">
            <span>Groq Standard Models</span>
            {!hasGroq && <span className="text-xs text-amber-500">(Key required)</span>}
          </SelectLabel>
          {groqModels.filter(model => !['compound-beta', 'compound-beta-mini'].includes(model.id)).map((model) => (
            <SelectItem 
              key={model.id} 
              value={model.id}
              disabled={!hasGroq}
            >
              {model.name}
            </SelectItem>
          ))}
        </SelectGroup>
        
        <SelectGroup>
          <SelectLabel className="flex items-center justify-between mt-2">
            <span>Groq Agentic Models</span>
            {!hasGroq && <span className="text-xs text-amber-500">(Key required)</span>}
          </SelectLabel>
          {groqModels.filter(model => ['compound-beta', 'compound-beta-mini'].includes(model.id)).map((model) => (
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
