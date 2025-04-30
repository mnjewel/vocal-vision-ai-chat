import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Search, Code, FileText } from 'lucide-react';
import { ModelCapability } from '@/services/ModelManager';

interface ModelCapabilitiesProps {
  capabilities: ModelCapability[];
}

const ModelCapabilities: React.FC<ModelCapabilitiesProps> = ({ capabilities }) => {
  if (capabilities.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {capabilities.map(capability => (
        <TooltipProvider key={capability.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge 
                variant="outline" 
                className={`
                  ${capability.id === 'web_search' ? 'bg-blue-50/80 dark:bg-blue-900/30 text-xs border-blue-200/50 dark:border-blue-700/30' : 
                   capability.id === 'code_execution' ? 'bg-green-50/80 dark:bg-green-900/30 text-xs border-green-200/50 dark:border-green-700/30' :
                   'bg-purple-50/80 dark:bg-purple-900/30 text-xs border-purple-200/50 dark:border-purple-700/30'
                  }
                `}
              >
                {capability.id === 'web_search' && <Search className="h-3 w-3 mr-1 text-blue-600 dark:text-blue-400" />}
                {capability.id === 'code_execution' && <Code className="h-3 w-3 mr-1 text-green-600 dark:text-green-400" />}
                {capability.id === 'long_context' && <FileText className="h-3 w-3 mr-1 text-purple-600 dark:text-purple-400" />}
                {capability.name}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">{capability.description}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
};

export default ModelCapabilities;
