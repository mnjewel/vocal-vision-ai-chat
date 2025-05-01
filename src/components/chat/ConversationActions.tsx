
import React from 'react';
import { Button } from '@/components/ui/button';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Brain, GitBranch, Download, Mic } from 'lucide-react';
import { ModelManager } from '@/services/ModelManager';
import VoiceConversationPanel from './VoiceConversationPanel';

interface ConversationActionsProps {
  activePersona: string;
  availablePersonas: any[];
  onPersonaChange: (personaId: string) => void;
  onForkConversation: () => void;
  onExportConversation: () => void;
  showPersonaSelector: boolean;
  setShowPersonaSelector: (show: boolean) => void;
}

const ConversationActions: React.FC<ConversationActionsProps> = ({
  activePersona,
  availablePersonas,
  onPersonaChange,
  onForkConversation,
  onExportConversation,
  showPersonaSelector,
  setShowPersonaSelector
}) => {
  // Get current persona
  const getCurrentPersona = () => {
    return availablePersonas.find(p => p.id === activePersona) || availablePersonas[0];
  };

  return (
    <div className="flex flex-wrap gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Popover open={showPersonaSelector} onOpenChange={setShowPersonaSelector}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5"
                >
                  <Brain className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{getCurrentPersona().name}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-0">
                <div className="p-3 border-b">
                  <h3 className="text-sm font-medium">Select Persona</h3>
                  <p className="text-xs text-muted-foreground">Choose how the assistant behaves</p>
                </div>
                <div className="py-2 max-h-60 overflow-y-auto">
                  {availablePersonas.map(persona => (
                    <button
                      key={persona.id}
                      className={`w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                        activePersona === persona.id ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                      }`}
                      onClick={() => onPersonaChange(persona.id)}
                    >
                      <div className="flex items-center">
                        <div className="text-sm font-medium">{persona.name}</div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{persona.description}</div>
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </TooltipTrigger>
          <TooltipContent>
            <p>Select assistant persona</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5"
              onClick={onForkConversation}
            >
              <GitBranch className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Fork</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Create a new branch from this conversation</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5"
              onClick={onExportConversation}
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Export conversation as markdown</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Voice conversation button */}
      <VoiceConversationPanel />
    </div>
  );
};

export default ConversationActions;
