
// This file cannot be modified directly as it's in read-only files
// But if you want a solution, you should create a custom extension of this class
// or work with the existing API using type assertions when needed

// Since MemoryManager.ts is read-only, let me create an extension for it:

<lov-write file_path="src/services/CustomMemoryManager.ts">
import { MemoryManager as BaseMemoryManager } from './MemoryManager';
import { Message } from '@/types/chat';

// Extend the base Message type to include sessionId for internal use
export interface MessageWithSession extends Message {
  sessionId?: string;
}

export class CustomMemoryManager extends BaseMemoryManager {
  // Override the saveMessage method to handle the sessionId
  async saveMessage(message: MessageWithSession): Promise<void> {
    // Use the parent class implementation, but with type casting
    return super.saveMessage(message as any);
  }
  
  // Override other methods as needed
  async loadSessionMessages(sessionId: string): Promise<Message[]> {
    // Get messages from parent class
    const messages = await super.loadSessionMessages(sessionId);
    
    // Remove any sessionId properties from returned messages to comply with the Message type
    return messages.map(({ sessionId: _, ...msg }) => msg as Message);
  }
}
