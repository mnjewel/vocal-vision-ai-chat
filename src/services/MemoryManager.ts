
import { Message } from '@/types/chat';

export class MemoryManager {
  private sessionId: string;
  private messages: Message[] = [];
  
  constructor(sessionId?: string) {
    this.sessionId = sessionId || 'default-session';
  }
  
  async saveMessage(message: Message): Promise<void> {
    // Add message to in-memory storage
    this.messages.push(message);
  }
  
  async deleteMessage(messageId: string): Promise<void> {
    // Remove message from in-memory storage
    this.messages = this.messages.filter(msg => msg.id !== messageId);
  }
  
  async loadSessionMessages(sessionId: string): Promise<Message[]> {
    // Return messages for the specified session
    return this.messages.filter(msg => 
      // Check if the message has a sessionId property (using type assertion)
      (msg as any).sessionId === sessionId || 
      // If no sessionId, assume it belongs to current session
      !(msg as any).sessionId && this.sessionId === sessionId
    );
  }
  
  async clearSessionMessages(sessionId: string): Promise<void> {
    // Clear messages for the specified session
    this.messages = this.messages.filter(msg => 
      (msg as any).sessionId !== sessionId
    );
  }
  
  getContextWindow(): Message[] {
    // Return all messages for the current session
    return this.messages;
  }
}
