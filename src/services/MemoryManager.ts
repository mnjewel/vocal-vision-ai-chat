
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/chat';

export class MemoryManager {
  sessionId: string;
  activeMessages: Message[] = [];
  branches: any[] = [];
  memorySnapshots: any[] = [];

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  async loadSessionMessages(sessionId: string): Promise<Message[]> {
    try {
      // Load messages from Supabase
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (messagesError) {
        throw messagesError;
      }

      // Convert to Message objects
      this.activeMessages = messagesData.map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: new Date(m.created_at),
      }));

      try {
        // Try to load branches
        await this.loadBranches();
      } catch (error) {
        console.error('Error loading branches:', error);
      }

      return this.activeMessages;
    } catch (error) {
      console.error('Error loading messages:', error);
      return [];
    }
  }

  async loadBranches(): Promise<void> {
    // Fetch branches from Supabase (sessions with this session as parent)
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('parent_id', this.sessionId);

      if (error) {
        throw error;
      }

      this.branches = data || [];
    } catch (error) {
      console.error('Error loading branches:', error);
    }
  }

  async createSnapshot(): Promise<void> {
    // Create a snapshot of the current state
    const snapshot = {
      id: uuidv4(),
      sessionId: this.sessionId,
      messages: [...this.activeMessages],
      timestamp: new Date(),
    };

    this.memorySnapshots.push(snapshot);
  }

  async saveMessage(message: Message): Promise<void> {
    try {
      // Save to local state
      this.activeMessages.push(message);

      // Save to Supabase
      const { error } = await supabase.from('messages').insert({
        id: message.id,
        role: message.role,
        content: message.content,
        session_id: this.sessionId,
        created_at: message.timestamp ? message.timestamp.toISOString() : new Date().toISOString(),
      });

      if (error) {
        throw error;
      }

      // Create a new snapshot occasionally
      if (this.activeMessages.length % 10 === 0) {
        await this.createSnapshot();
      }
    } catch (error) {
      console.error('Error saving message:', error);
    }
  }

  async deleteMessage(messageId: string): Promise<void> {
    try {
      // Remove from local state
      this.activeMessages = this.activeMessages.filter(m => m.id !== messageId);

      // Remove from Supabase
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) {
        throw error;
      }

      // Create a new snapshot after deletion
      await this.createSnapshot();
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  }

  getContextWindow(): Message[] {
    // Return messages for context window (possibly with some filtering/processing)
    return this.activeMessages;
  }

  async createBranch(): Promise<string | null> {
    try {
      // Create a new session with this session as parent
      const newSessionId = uuidv4();
      const { error } = await supabase.from('chat_sessions').insert({
        id: newSessionId,
        user_id: '00000000-0000-0000-0000-000000000000', // This should be the actual user ID
        title: 'Branched Conversation',
        parent_id: this.sessionId,
      });

      if (error) {
        throw error;
      }

      // Copy messages to the new branch
      for (const message of this.activeMessages) {
        await supabase.from('messages').insert({
          id: uuidv4(),
          role: message.role,
          content: message.content,
          session_id: newSessionId,
          created_at: message.timestamp ? message.timestamp.toISOString() : new Date().toISOString(),
        });
      }

      // Add to branches
      this.branches.push({
        id: newSessionId,
        parent_id: this.sessionId,
        title: 'Branched Conversation',
      });

      return newSessionId;
    } catch (error) {
      console.error('Error creating branch:', error);
      return null;
    }
  }

  async createMemorySnapshot(): Promise<void> {
    await this.createSnapshot();
  }

  searchMessages(query: string): Message[] {
    // Simple search implementation - can be enhanced
    const lowerQuery = query.toLowerCase();
    return this.activeMessages.filter(m => 
      m.content.toLowerCase().includes(lowerQuery)
    );
  }
}
