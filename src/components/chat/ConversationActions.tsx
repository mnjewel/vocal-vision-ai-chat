
import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Share2, Users } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import PersonaSelector from './PersonaSelector';

interface ConversationActionsProps {
  activePersona: string;
  availablePersonas: any[];
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
  setShowPersonaSelector,
}) => {
  return (
    <div className="flex items-center space-x-1.5">
      <Popover open={showPersonaSelector} onOpenChange={setShowPersonaSelector}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Persona</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-2" align="start" side="top">
          <PersonaSelector
            personas={availablePersonas}
            activePersonaId={activePersona}
            onSelectPersona={onPersonaChange}
          />
        </PopoverContent>
      </Popover>

      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={onForkConversation}
      >
        <Share2 className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Fork</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={onExportConversation}
      >
        <Copy className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Export</span>
      </Button>
    </div>
  );
};

export default ConversationActions;
