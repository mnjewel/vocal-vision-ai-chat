
import { MemoryManager as BaseMemoryManager } from './MemoryManager';
import { Message } from '@/types/chat';

// Extended Message type to include sessionId for internal use
interface ExtendedMessage extends Message {
  sessionId?: string;
}

export class CustomMemoryManager extends BaseMemoryManager {
  // Override the saveMessage method to handle the sessionId
  async saveMessage(message: Message | ExtendedMessage): Promise<void> {
    // Check if message has an additional sessionId property
    const messageData = message as ExtendedMessage;
    
    // Create a clean copy of the message without sessionId
    const { sessionId, ...cleanMessage } = messageData;
    
    // Use the parent class implementation with the cleaned message
    return super.saveMessage(cleanMessage);
  }
  
  // Override other methods as needed
  async loadSessionMessages(sessionId: string): Promise<Message[]> {
    // Get messages from parent class
    const messages = await super.loadSessionMessages(sessionId);
    
    // Return messages without any sessionId properties
    return messages.map(message => {
      const messageData = message as ExtendedMessage;
      // Create a clean copy without sessionId if it exists
      if (messageData.sessionId) {
        const { sessionId, ...cleanMessage } = messageData;
        return cleanMessage as Message;
      }
      return message;
    });
  }
}
