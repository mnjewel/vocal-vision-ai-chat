
import { supabase } from '@/integrations/supabase/client';
import { Message, MessageRole } from '@/types/chat';
import { v4 as uuidv4 } from 'uuid';

export class MemoryManager {
  private userId: string | undefined;
  private messagesCache: Map<string, Message[]>;
  private sessionDataCache: Map<string, any>;
  private contextWindow: number;

  constructor(userId?: string, contextWindow = 10) {
    this.userId = userId;
    this.messagesCache = new Map();
    this.sessionDataCache = new Map();
    this.contextWindow = contextWindow;
  }

  async loadSessionMessages(sessionId: string): Promise<Message[]> {
    if (this.messagesCache.has(sessionId)) {
      return this.messagesCache.get(sessionId) || [];
    }

    try {
      // We don't need to use branches here, so removing the reference
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
        return [];
      }

      // Format messages
      const messages: Message[] = data.map((msg: any) => ({
        id: msg.id,
        role: msg.role as MessageRole,
        content: msg.content,
        timestamp: new Date(msg.created_at || Date.now()),
        imageUrl: msg.image_url,
        model: msg.model
      }));

      this.messagesCache.set(sessionId, messages);
      return messages;
    } catch (error) {
      console.error('Error loading session messages:', error);
      return [];
    }
  }

  async loadBranches(sessionId: string) {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('id')
        .eq('id', sessionId);

      if (error) {
        console.error('Error loading branches:', error);
        return [];
      }

      return data;
    } catch (error) {
      console.error('Error loading branches:', error);
      return [];
    }
  }

  async saveMessage(message: Message): Promise<void> {
    const { id, role, content } = message;
    
    // Extract sessionId from message if available (using type assertion for compatibility)
    // This allows our code to work with Message objects that might have a sessionId property
    // added by useChat even though it's not in the actual Message type
    const sessionId = (message as any).sessionId || id;
    
    if (!sessionId) {
      console.warn('No session ID provided for message:', message);
      return;
    }

    try {
      // Add to cache first
      const sessionMessages = this.messagesCache.get(sessionId) || [];
      sessionMessages.push(message);
      this.messagesCache.set(sessionId, sessionMessages);

      // Then save to database if user is authenticated
      if (this.userId) {
        const { error } = await supabase.from('messages').insert({
          id: id || uuidv4(),
          session_id: sessionId,
          role,
          content,
          image_url: message.imageUrl,
          model: message.model
        });

        if (error) {
          console.error('Error saving message:', error);
        }
      }
    } catch (error) {
      console.error('Error saving message:', error);
    }
  }

  async deleteMessage(messageId: string): Promise<void> {
    try {
      // Remove from all session caches
      this.messagesCache.forEach((messages, sessionId) => {
        const updatedMessages = messages.filter(msg => msg.id !== messageId);
        this.messagesCache.set(sessionId, updatedMessages);
      });

      // Delete from database if user is authenticated
      if (this.userId) {
        const { error } = await supabase
          .from('messages')
          .delete()
          .eq('id', messageId);

        if (error) {
          console.error('Error deleting message:', error);
        }
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  }

  async clearSessionMessages(sessionId: string): Promise<void> {
    try {
      // Clear from cache
      this.messagesCache.set(sessionId, []);

      // Delete from database if user is authenticated
      if (this.userId) {
        const { error } = await supabase
          .from('messages')
          .delete()
          .eq('session_id', sessionId);

        if (error) {
          console.error('Error clearing session messages:', error);
        }
      }
    } catch (error) {
      console.error('Error clearing session messages:', error);
    }
  }

  getContextWindow(): Message[] {
    // Get all messages from all sessions
    let allMessages: Message[] = [];
    
    this.messagesCache.forEach(messages => {
      allMessages = [...allMessages, ...messages];
    });
    
    // Sort by timestamp
    allMessages.sort((a, b) => {
      const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return timeA - timeB;
    });
    
    // Return the most recent messages based on context window size
    return allMessages.slice(-this.contextWindow);
  }

  getSessionData(sessionId: string): any {
    return this.sessionDataCache.get(sessionId);
  }

  setSessionData(sessionId: string, data: any): void {
    this.sessionDataCache.set(sessionId, data);
  }
}
