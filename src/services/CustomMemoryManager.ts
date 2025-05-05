
import { MemoryManager as BaseMemoryManager } from './MemoryManager';
import { Message } from '@/types/chat';

// Extended Message type to include sessionId for internal use
interface MessageWithSession extends Message {
  sessionId?: string;
}

export class CustomMemoryManager extends BaseMemoryManager {
  // Override the saveMessage method to handle the sessionId
  async saveMessage(message: Message): Promise<void> {
    // Check if message has an additional sessionId property (from MessageWithSession)
    // We need to use type assertion since TypeScript doesn't know about the extra property
    const messageData = message as MessageWithSession;
    const { sessionId, ...cleanMessage } = messageData;
    
    // Use the parent class implementation with the cleaned message
    return super.saveMessage(cleanMessage);
  }
  
  // Override other methods as needed
  async loadSessionMessages(sessionId: string): Promise<Message[]> {
    // Get messages from parent class
    const messages = await super.loadSessionMessages(sessionId);
    
    // Return messages without any sessionId properties
    return messages;
  }
}
