
import React from 'react';
import { Button } from "@/components/ui/button";

interface FollowUpSuggestionsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
}

const FollowUpSuggestions: React.FC<FollowUpSuggestionsProps> = ({ 
  suggestions, 
  onSuggestionClick 
}) => {
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mt-3 mb-1 max-w-full overflow-hidden">
      {suggestions.map((suggestion, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          className="rounded-full bg-background/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/30 hover:bg-primary/10 hover:text-primary transition-all"
          onClick={() => onSuggestionClick(suggestion)}
        >
          {suggestion}
        </Button>
      ))}
    </div>
  );
};

export default FollowUpSuggestions;
