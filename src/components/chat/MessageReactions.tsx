
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";

interface Reaction {
  emoji: string;
  label: string;
  count: number;
  active: boolean;
}

interface MessageReactionsProps {
  messageId: string;
  onReactionToggle?: (messageId: string, reaction: string, active: boolean) => void;
}

const MessageReactions: React.FC<MessageReactionsProps> = ({ messageId, onReactionToggle }) => {
  const [reactions, setReactions] = useState<Reaction[]>([
    { emoji: "👍", label: "Thumbs up", count: 0, active: false },
    { emoji: "❤️", label: "Heart", count: 0, active: false },
    { emoji: "🎯", label: "Bullseye", count: 0, active: false },
    { emoji: "🤔", label: "Thinking", count: 0, active: false }
  ]);

  const handleReaction = (index: number) => {
    const newReactions = [...reactions];
    const reaction = newReactions[index];
    
    // Toggle reaction state
    reaction.active = !reaction.active;
    reaction.count += reaction.active ? 1 : -1;
    
    setReactions(newReactions);
    
    if (onReactionToggle) {
      onReactionToggle(messageId, reaction.emoji, reaction.active);
    }
  };

  return (
    <div className="flex space-x-1 mt-1 mb-2 transition-opacity opacity-70 hover:opacity-100">
      {reactions.map((reaction, index) => (
        <Button 
          key={reaction.emoji}
          variant="ghost" 
          size="sm"
          className={`rounded-full px-2 py-1 h-auto text-xs ${reaction.active ? 'bg-primary/10 text-primary' : ''}`}
          onClick={() => handleReaction(index)}
        >
          <span className="mr-1">{reaction.emoji}</span>
          {reaction.count > 0 && <span>{reaction.count}</span>}
        </Button>
      ))}
    </div>
  );
};

export default MessageReactions;
