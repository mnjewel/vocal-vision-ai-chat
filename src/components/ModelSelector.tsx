
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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

  // Group models into categories
  const standardModels = groqModels.filter(model => 
    !['compound-beta', 'compound-beta-mini'].includes(model.id)
  );
  
  const agenticModels = groqModels.filter(model => 
    ['compound-beta', 'compound-beta-mini'].includes(model.id)
  );

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
          {standardModels.map((model) => (
            <SelectItem 
              key={model.id} 
              value={model.id}
              disabled={!hasGroq}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-between w-full">
                      <span>{model.name}</span>
                      {model.id === 'llama-3.3-70b-versatile' && (
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-full">
                          128K
                        </span>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {model.id === 'llama-3.3-70b-versatile' ? 'Most powerful general-purpose model with 128K context' :
                       model.id === 'llama-3.1-8b-instant' ? 'Fast, efficient model for quick responses' :
                       'Standard Groq model'}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </SelectItem>
          ))}
        </SelectGroup>
        
        <SelectGroup>
          <SelectLabel className="flex items-center justify-between mt-2">
            <span>Groq Agentic Models</span>
            {!hasGroq && <span className="text-xs text-amber-500">(Key required)</span>}
          </SelectLabel>
          {agenticModels.map((model) => (
            <SelectItem 
              key={model.id} 
              value={model.id}
              disabled={!hasGroq}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-between w-full">
                      <span>{model.name}</span>
                      <span className="text-xs bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded-full">
                        {model.id === 'compound-beta-mini' ? 'Fast' : 'Advanced'}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {model.id === 'compound-beta' ? 'Advanced agentic model that can search the web and run code' :
                       'Faster agentic model with web search and code execution'}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default ModelSelector;
