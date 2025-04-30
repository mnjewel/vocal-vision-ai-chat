import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Split, Download } from 'lucide-react';
import PersonaSelector from './PersonaSelector';
import { ModelPersona } from '@/services/ModelManager';

interface ConversationActionsProps {
  activePersona: string;
  availablePersonas: ModelPersona[];
  onPersonaChange: (personaId: string) => void;
  onForkConversation: () => Promise<void>;
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
  return (
    <div className="flex gap-2">
      <PersonaSelector
        activePersona={activePersona}
        availablePersonas={availablePersonas}
        onPersonaChange={onPersonaChange}
        isOpen={showPersonaSelector}
        setIsOpen={setShowPersonaSelector}
      />
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5"
                onClick={onForkConversation}
              >
                <Split className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Fork</span>
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Create a branch of this conversation</p>
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
            <p>Export conversation as JSON</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default ConversationActions;
