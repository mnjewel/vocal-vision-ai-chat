
import React from 'react';
import { Brain, FileText, Code, Hash } from 'lucide-react';
import { Popover, PopoverContent } from '@/components/ui/popover';
import { Persona } from '@/types/chat';

interface PersonaSelectorProps {
  activePersona: string;
  personas: Persona[];
  onPersonaChange: (personaId: string) => void;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const PersonaSelector: React.FC<PersonaSelectorProps> = ({
  activePersona,
  personas,
  onPersonaChange,
  isOpen,
  onOpenChange
}) => {
  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverContent className="w-72 p-0" side="top">
        <div className="p-3 border-b">
          <h3 className="text-sm font-medium">Select Persona</h3>
          <p className="text-xs text-muted-foreground">Choose how the assistant behaves</p>
        </div>
        <div className="py-2 max-h-60 overflow-y-auto">
          {personas.map(persona => (
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
                  {persona.id === 'researcher' && <FileText className="h-4 w-4" />}
                  {persona.id === 'coder' && <Code className="h-4 w-4" />}
                  {persona.id === 'analyst' && <Hash className="h-4 w-4" />}
                  {persona.id === 'default' && <Brain className="h-4 w-4" />}
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
  );
};

export default PersonaSelector;
