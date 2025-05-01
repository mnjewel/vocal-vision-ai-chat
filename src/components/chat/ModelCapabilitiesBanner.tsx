import React from 'react';
import { X, Search, Code, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
// Update import to use the correct type
import { type Persona } from '@/types/chat';

interface ModelCapabilitiesBannerProps {
  isAgentic: boolean;
  hasApiKey: boolean;
  currentPersona: Persona;
  onClearPersona: () => void;
}

const ModelCapabilitiesBanner: React.FC<ModelCapabilitiesBannerProps> = ({
  isAgentic,
  hasApiKey,
  currentPersona,
  onClearPersona
}) => {
  if (!isAgentic || !hasApiKey) {
    return null;
  }

  return (
    <div className="mx-4 mt-2 p-4 neural-glass rounded-lg border border-amber-200/50 dark:border-amber-700/30 shadow-neural">
      <div className="flex items-center space-x-2 mb-2">
        <div className="p-1.5 bg-amber-100/80 dark:bg-amber-900/30 rounded-full">
          <Search className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="p-1.5 bg-amber-100/80 dark:bg-amber-900/30 rounded-full">
          <Code className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="p-1.5 bg-amber-100/80 dark:bg-amber-900/30 rounded-full">
          <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
        </div>
        <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
          Agentic Model Capabilities
        </span>
      </div>
      <p className="text-xs text-amber-600 dark:text-amber-300 mb-2">
        This model can use tools to search the web, analyze data, and generate code.
      </p>
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearPersona}
          className="h-6 px-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100/50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/30"
        >
          <X className="h-3.5 w-3.5 mr-1" /> Clear
        </Button>
      </div>
    </div>
  );
};

export default ModelCapabilitiesBanner;
