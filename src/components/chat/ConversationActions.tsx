
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  User, 
  GitFork, 
  Download, 
  ChevronDown,
  Trash2,
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Persona } from '@/types/chat';

interface ConversationActionsProps {
  activePersona: string;
  availablePersonas: Persona[];
  onPersonaChange: (personaId: string) => void;
  onForkConversation: () => void;
  onExportConversation: () => void;
  onClearConversation?: () => void;
  showPersonaSelector: boolean;
  setShowPersonaSelector: (show: boolean) => void;
}

const ConversationActions: React.FC<ConversationActionsProps> = ({
  activePersona,
  availablePersonas,
  onPersonaChange,
  onForkConversation,
  onExportConversation,
  onClearConversation,
  showPersonaSelector,
  setShowPersonaSelector,
}) => {
  const currentPersona = availablePersonas.find(p => p.id === activePersona) || availablePersonas[0];

  return (
    <>
      {/* Persona Selector */}
      <DropdownMenu open={showPersonaSelector} onOpenChange={setShowPersonaSelector}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1 bg-background">
            <User className="h-3.5 w-3.5" />
            <span className="truncate max-w-[100px] hidden sm:inline-block">
              {currentPersona?.name || "Default"}
            </span>
            <ChevronDown className="h-3.5 w-3.5 opacity-70" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="start" className="w-56">
          {availablePersonas.map((persona) => (
            <DropdownMenuItem
              key={persona.id}
              className={`flex flex-col items-start space-y-1 ${persona.id === activePersona ? 'bg-accent text-accent-foreground' : ''}`}
              onClick={() => onPersonaChange(persona.id)}
            >
              <div className="font-medium">{persona.name}</div>
              <div className="text-xs text-muted-foreground line-clamp-1">
                {persona.description}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Fork Button */}
      <Button 
        variant="outline" 
        size="sm" 
        className="h-8 w-8" 
        title="Fork conversation"
        onClick={onForkConversation}
      >
        <GitFork className="h-3.5 w-3.5" />
      </Button>

      {/* Export Button */}
      <Button 
        variant="outline" 
        size="sm" 
        className="h-8 w-8" 
        title="Export conversation"
        onClick={onExportConversation}
      >
        <Download className="h-3.5 w-3.5" />
      </Button>

      {/* Clear Button */}
      {onClearConversation && (
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 w-8" 
          title="Clear conversation"
          onClick={onClearConversation}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      )}
    </>
  );
};

export default ConversationActions;
