
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ModelCapabilitiesBannerProps {
  isAgentic: boolean;
  hasApiKey: boolean;
  currentPersona: {
    id: string;
    name: string;
    description: string;
  };
  onClearPersona: () => void;
}

const ModelCapabilitiesBanner: React.FC<ModelCapabilitiesBannerProps> = ({
  isAgentic,
  hasApiKey,
  currentPersona,
  onClearPersona,
}) => {
  if (!isAgentic || !hasApiKey) return null;

  return (
    <div className="p-4 mb-2 rounded-md bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-700/30 text-amber-900 dark:text-amber-200 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex space-x-2">
          <div className="flex-shrink-0 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium">Agentic Model Capabilities</p>
            <p className="text-xs mt-1">This model can use tools to search the web, analyze data, and generate code.</p>
            {currentPersona && currentPersona.id !== 'default' && (
              <p className="text-xs mt-2">Using <span className="font-semibold">{currentPersona.name}</span> persona</p>
            )}
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 text-amber-500 hover:text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/30"
          onClick={onClearPersona}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Clear</span>
        </Button>
      </div>
    </div>
  );
};

export default ModelCapabilitiesBanner;
