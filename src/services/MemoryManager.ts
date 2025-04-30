import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/hooks/useChat';
import { v4 as uuidv4 } from 'uuid';

interface MemoryOptions {
  maxContextSize?: number;
  includeSystemPrompts?: boolean;
}

export class MemoryManager {
  sessionId: string;
  activeMessages: Message[] = [];
  options: MemoryOptions = {
    maxContextSize: 10,
    includeSystemPrompts: true
  };

  constructor(sessionId?: string, options?: Partial<MemoryOptions>) {
    this.sessionId = sessionId || uuidv4();
    this.options = { ...this.options, ...options };
  }

  async saveMessage(message: Message): Promise<void> {
    try {
      // Add message to local memory
      this.activeMessages.push(message);
      
      // Skip Supabase saving if user is not logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      // Save to Supabase if user is authenticated
      await supabase.from('messages').insert({
        id: message.id,
        session_id: this.sessionId,
        role: message.role,
        content: message.content,
        model: message.model
      });
    } catch (error) {
      console.error('Error saving message to memory:', error);
    }
  }

  async loadSessionMessages(sessionId: string): Promise<Message[]> {
    try {
      // Skip Supabase loading if user is not logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      const messages: Message[] = data.map(msg => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
        timestamp: new Date(msg.created_at),
        model: msg.model
      }));
      
      this.activeMessages = messages;
      return messages;
    } catch (error) {
      console.error('Error loading session messages:', error);
      return [];
    }
  }

  getContextWindow(includeSystem: boolean = true): Message[] {
    let context = [...this.activeMessages];
    
    // Optionally exclude system messages
    if (!includeSystem) {
      context = context.filter(msg => msg.role !== 'system');
    }
    
    // If context is too large, keep system prompts and most recent messages
    if (context.length > this.options.maxContextSize!) {
      const systemMessages = includeSystem ? context.filter(msg => msg.role === 'system') : [];
      const nonSystemMessages = context.filter(msg => msg.role !== 'system');
      
      // Get the most recent messages to fit within the context window
      const recentMessages = nonSystemMessages.slice(-1 * (this.options.maxContextSize! - systemMessages.length));
      
      // Combine system messages with recent messages
      context = [...systemMessages, ...recentMessages];
    }
    
    return context;
  }

  async summarizeContext(): Promise<string> {
    // This would use the AI to summarize the conversation
    // For now, return a simple summary based on message count
    const userMessages = this.activeMessages.filter(m => m.role === 'user');
    return `Conversation with ${userMessages.length} user messages`;
  }

  async createBranch(): Promise<string> {
    // Create a new session based on the current context
    const newSessionId = uuidv4();
    
    try {
      // Skip Supabase operations if user is not logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return newSessionId;
      
      // Create a new session entry
      await supabase.from('chat_sessions').insert({
        id: newSessionId,
        title: `Branch from ${this.sessionId}`,
        created_at: new Date().toISOString()
      });
      
      // Get a summary of the current conversation
      const summary = await this.summarizeContext();
      
      // Add a summary message to the new branch
      await supabase.from('messages').insert({
        id: uuidv4(),
        session_id: newSessionId,
        role: 'system',
        content: `This is a branch from another conversation. Previous context: ${summary}`,
        created_at: new Date().toISOString()
      });
      
      return newSessionId;
    } catch (error) {
      console.error('Error creating conversation branch:', error);
      return newSessionId;
    }
  }
}
