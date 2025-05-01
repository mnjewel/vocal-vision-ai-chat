
import React from 'react';
import { Check, Info } from 'lucide-react';
import { Command, CommandGroup, CommandItem } from '@/components/ui/command';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';

export interface PersonaSelectorProps {
  personas: any[];
  activePersona: string; // Changed from activePersonaId to match usage
  onSelectPersona: (personaId: string) => void;
}

const PersonaSelector: React.FC<PersonaSelectorProps> = ({ 
  personas, 
  activePersona, 
  onSelectPersona 
}) => {
  return (
    <Command>
      <CommandGroup heading="Available Personas">
        {personas.map((persona) => (
          <CommandItem
            key={persona.id}
            value={persona.id}
            className="flex items-center justify-between px-2 py-3 cursor-pointer"
            onSelect={() => onSelectPersona(persona.id)}
          >
            <div className="flex items-center">
              <div
                className={`mr-2 h-5 w-5 rounded-full flex items-center justify-center ${
                  activePersona === persona.id 
                    ? 'bg-primary text-white' 
                    : 'border border-gray-300'
                }`}
              >
                {activePersona === persona.id && <Check className="h-3 w-3" />}
              </div>
              <span className="font-medium">{persona.name}</span>
            </div>
            
            <HoverCard>
              <HoverCardTrigger asChild>
                <div 
                  className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Info className="h-4 w-4" />
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="w-80" side="right">
                <div className="flex flex-col gap-2">
                  <h3 className="font-semibold">{persona.name}</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {persona.description}
                  </p>
                  {persona.systemPrompt && (
                    <div className="mt-2">
                      <h4 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1">
                        System Prompt
                      </h4>
                      <p className="text-xs p-2 bg-neutral-100 dark:bg-neutral-800 rounded-md">
                        {persona.systemPrompt}
                      </p>
                    </div>
                  )}
                </div>
              </HoverCardContent>
            </HoverCard>
          </CommandItem>
        ))}
      </CommandGroup>
    </Command>
  );
};

export default PersonaSelector;
