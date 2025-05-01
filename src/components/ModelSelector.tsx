
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface ModelSelectorProps {
  selectedModel: string;
  onSelectModel: (model: string) => void;
  compact?: boolean;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onSelectModel, compact = false }) => {
  const models = [
    { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B' },
    { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B' },
    { id: 'llama3-70b-8192', name: 'Llama 3 70B' },
    { id: 'llama3-8b-8192', name: 'Llama 3 8B' },
    { id: 'gemma2-9b-it', name: 'Gemma 2 9B' },
    { id: 'deepseek-r1-distill-llama-70b', name: 'Deepseek R1 70B' },
    { id: 'compound-beta', name: 'Compound (Beta)' },
    { id: 'compound-beta-mini', name: 'Compound Mini (Beta)' }
  ];

  return (
    <Select
      value={selectedModel}
      onValueChange={onSelectModel}
    >
      <SelectTrigger className={`bg-white/80 dark:bg-gray-800/80 text-sm ${compact ? 'h-8 text-xs' : ''}`}>
        <SelectValue placeholder="Select model" />
      </SelectTrigger>
      <SelectContent>
        {models.map(model => (
          <SelectItem key={model.id} value={model.id} className="text-sm">
            {model.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ModelSelector;
