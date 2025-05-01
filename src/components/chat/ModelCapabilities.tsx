
import React from 'react';
import { MessageSquare, Code, Search, Terminal } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { ModelCapability } from '@/types/chat';

interface ModelCapabilitiesProps {
  capabilities: ModelCapability[];
}

const ModelCapabilities: React.FC<ModelCapabilitiesProps> = ({ capabilities }) => {
  // Function to get the appropriate icon for each capability
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'MessageSquare':
        return <MessageSquare className="h-3.5 w-3.5" />;
      case 'Code':
        return <Code className="h-3.5 w-3.5" />;
      case 'Search':
        return <Search className="h-3.5 w-3.5" />;
      case 'Terminal':
        return <Terminal className="h-3.5 w-3.5" />;
      default:
        return <MessageSquare className="h-3.5 w-3.5" />;
    }
  };

  if (!capabilities || capabilities.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-1">
      <TooltipProvider>
        {capabilities.map(capability => (
          <Tooltip key={capability.id}>
            <TooltipTrigger asChild>
              <div className="h-6 w-6 rounded-full bg-gray-200/80 dark:bg-gray-700/80 flex items-center justify-center">
                {getIcon(capability.icon)}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs font-medium">{capability.name}</p>
              <p className="text-xs text-muted-foreground">{capability.description}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  );
};

export default ModelCapabilities;
