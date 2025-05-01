import React from 'react';
import { Brain, GitBranch, Download, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from '@/components/ui/use-toast';
// Update import to use the correct type
import { type Persona } from '@/types/chat';

interface ConversationActionsProps {
  activePersona: string;
  availablePersonas: Persona[];
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
  return (
    <div className="flex gap-2">
      <Popover open={showPersonaSelector} onOpenChange={setShowPersonaSelector}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5"
          >
            <Brain className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{availablePersonas.find(p => p.id === activePersona)?.name || 'Personas'}</span>
            <ChevronDown className="h-4 w-4 opacity-70" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0" side="top">
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
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                    persona.id === 'researcher' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400' :
                    persona.id === 'coder' ? 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400' :
                    persona.id === 'analyst' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' :
                    'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                  }`}>
                    {persona.id === 'researcher' && <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text"><path d="M14.5 2H6A2 2 0 0 0 4 4v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/></svg>}
                    {persona.id === 'coder' && <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-code"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>}
                    {persona.id === 'analyst' && <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-hash"><line x1="5" x2="19" y1="9" y2="9"/><line x1="5" x2="19" y1="15" y2="15"/><line x1="11" x2="7" y1="4" y2="20"/><line x1="17" x2="13" y1="4" y2="20"/></svg>}
                    {persona.id === 'default' && <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-brain"><path d="M12 8a4 4 0 0 1 4 4 4 4 0 0 1-4 4 4 4 0 0 1-4-4 4 4 0 0 1 4-4Z"/><path d="M5 12H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2"/><path d="M19 12h2a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><path d="M7 12H5a2 2 0 0 1-2 2v3a2 2 0 0 1 2 2h2"/><path d="M17 12h2a2 2 0 0 0 2 2v3a2 2 0 0 0-2 2h-2"/><path d="M12 5V3a2 2 0 0 0-2-2H7a2 2 0 0 0 0 4h3"/><path d="M12 19v2a2 2 0 0 1 2 2h3a2 2 0 0 1 0-4h-3"/></svg>}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{persona.name}</div>
                    <div className="text-xs text-muted-foreground">{persona.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-1.5"
        onClick={onForkConversation}
      >
        <GitBranch className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Fork</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-1.5"
        onClick={onExportConversation}
      >
        <Download className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Export</span>
      </Button>
    </div>
  );
};

export default ConversationActions;
