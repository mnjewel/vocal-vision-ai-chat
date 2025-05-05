
import { MemoryManager as BaseMemoryManager } from './MemoryManager';
import { Message } from '@/types/chat';

// Extend the Message type to include sessionId for internal use
interface MessageWithSession extends Message {
  sessionId?: string;
}

export class CustomMemoryManager extends BaseMemoryManager {
  // Override the saveMessage method to handle the sessionId
  async saveMessage(message: MessageWithSession): Promise<void> {
    // Remove sessionId before passing to parent class if it exists
    const { sessionId, ...messageData } = message;
    
    // Use the parent class implementation with the cleaned message
    return super.saveMessage(messageData as Message);
  }
  
  // Override other methods as needed
  async loadSessionMessages(sessionId: string): Promise<Message[]> {
    // Get messages from parent class
    const messages = await super.loadSessionMessages(sessionId);
    
    // Return messages without any sessionId properties
    return messages;
  }
}
