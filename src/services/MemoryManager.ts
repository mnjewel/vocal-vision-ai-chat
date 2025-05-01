
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { Message, MessageRole } from '@/types/chat';

interface MemorySnapshot {
  id: string;
  timestamp: string;
  summary: string;
  messageIds: string[];
}

interface Branch {
  id: string;
  parentId: string;
  name: string;
  createdAt: string;
}

export interface SessionData {
  id: string;
  title: string;
  model?: string;
  created_at: string;
  user_id?: string;
}

export class MemoryManager {
  sessionId: string;
  activeMessages: Message[];
  memorySnapshots: MemorySnapshot[];
  branches: Branch[];

  constructor(sessionId: string) {
    this.sessionId = sessionId;
    this.activeMessages = [];
    this.memorySnapshots = [];
    this.branches = [];
  }

  // Load messages from a specific session
  async loadSessionMessages(sessionId: string): Promise<Message[]> {
    try {
      // Get messages from Supabase
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return [];
      }

      // Transform Supabase message format to app Message format
      const formattedMessages = messages?.map(msg => ({
        id: msg.id,
        role: msg.role as MessageRole,
        content: msg.content,
        timestamp: new Date(msg.created_at).toISOString(),
        sessionId: msg.session_id,
      })) || [];

      // Set active messages for this session
      this.activeMessages = formattedMessages;
      
      // Load memory snapshots
      await this.loadMemorySnapshots(sessionId);
      
      // Load branches
      await this.loadBranches();

      return formattedMessages;
    } catch (error) {
      console.error('Error in loadSessionMessages:', error);
      return [];
    }
  }

  // Load branches for this session
  async loadBranches(): Promise<void> {
    try {
      // Query requires 'parent_id' column to exist in the chat_sessions table
      const { data: branchesData, error } = await supabase
        .from('chat_sessions')
        .select('id, parent_id, title, created_at')
        .eq('parent_id', this.sessionId);

      if (error) {
        console.error('Error loading branches:', error);
        this.branches = [];
        return;
      }

      if (branchesData) {
        this.branches = branchesData.map(branch => ({
          id: branch.id,
          parentId: branch.parent_id,
          name: branch.title,
          createdAt: branch.created_at
        }));
      }
    } catch (error) {
      console.error('Error in loadBranches:', error);
      this.branches = [];
    }
  }

  // Save a new session to the database
  async saveSession(sessionData: SessionData): Promise<string | null> {
    try {
      // We need to include user_id if the table requires it
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          id: sessionData.id,
          title: sessionData.title,
          created_at: sessionData.created_at,
          user_id: sessionData.user_id || 'anonymous' // Using 'anonymous' as fallback
        })
        .select();

      if (error) {
        console.error('Error saving session:', error);
        return null;
      }

      return data?.[0]?.id || null;
    } catch (error) {
      console.error('Error in saveSession:', error);
      return null;
    }
  }

  // Create a new branch from the current conversation
  async createBranch(): Promise<string | null> {
    try {
      const branchId = uuidv4();
      const branchTitle = `Branch from ${this.sessionId}`;
      
      const newSessionData: SessionData = {
        id: branchId,
        title: branchTitle,
        created_at: new Date().toISOString(),
        user_id: 'anonymous' // Using 'anonymous' as fallback
      };
      
      // Save the new session
      const savedSessionId = await this.saveSession(newSessionData);
      
      if (!savedSessionId) {
        return null;
      }
      
      // Clone messages to the new branch
      for (const message of this.activeMessages) {
        await this.saveMessageToBranch(message, branchId);
      }
      
      // Update branches list
      this.branches.push({
        id: branchId,
        parentId: this.sessionId,
        name: branchTitle,
        createdAt: new Date().toISOString()
      });
      
      return branchId;
    } catch (error) {
      console.error('Error in createBranch:', error);
      return null;
    }
  }

  // Save a message to a specific branch
  async saveMessageToBranch(message: Message, branchId: string): Promise<void> {
    try {
      await supabase
        .from('messages')
        .insert({
          id: uuidv4(),
          content: message.content,
          role: message.role,
          session_id: branchId,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error in saveMessageToBranch:', error);
    }
  }

  // Save a message to the current session
  async saveMessage(message: Message): Promise<void> {
    try {
      // Save to Supabase
      const { error } = await supabase
        .from('messages')
        .insert({
          id: message.id || uuidv4(),
          content: message.content,
          role: message.role,
          session_id: this.sessionId,
          created_at: new Date(message.timestamp || Date.now()).toISOString()
        });

      if (error) {
        console.error('Error saving message:', error);
        return;
      }

      // Update local active messages
      this.activeMessages.push(message);
      
      // Create a memory snapshot periodically
      if (this.shouldCreateSnapshot()) {
        await this.createMemorySnapshot();
      }
    } catch (error) {
      console.error('Error in saveMessage:', error);
    }
  }

  // Delete a message
  async deleteMessage(messageId: string): Promise<void> {
    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) {
        console.error('Error deleting message:', error);
        return;
      }

      // Update local active messages
      this.activeMessages = this.activeMessages.filter(msg => msg.id !== messageId);
    } catch (error) {
      console.error('Error in deleteMessage:', error);
    }
  }

  // Search through messages
  searchMessages(query: string): Message[] {
    if (!query.trim()) {
      return [];
    }

    const lowerQuery = query.toLowerCase();
    return this.activeMessages.filter(msg => 
      msg.content.toLowerCase().includes(lowerQuery)
    );
  }

  // Load memory snapshots for a session
  async loadMemorySnapshots(sessionId: string): Promise<void> {
    // Implement snapshot loading from database
    // This is a placeholder - in a real implementation, you would fetch snapshots from Supabase
    this.memorySnapshots = [];
  }

  // Create a memory snapshot
  async createMemorySnapshot(): Promise<void> {
    // Create a snapshot of the current context
    const snapshot: MemorySnapshot = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      summary: this.generateSummary(),
      messageIds: this.activeMessages.map(msg => msg.id || '')
    };
    
    this.memorySnapshots.push(snapshot);
    
    // In a real implementation, you would save this to Supabase
    console.log('Memory snapshot created:', snapshot);
  }

  // Generate a summary of the conversation
  private generateSummary(): string {
    // This is a placeholder - in a real implementation, you would use an LLM to generate a summary
    const messageCount = this.activeMessages.length;
    return `Conversation with ${messageCount} messages`;
  }

  // Determine if we should create a new snapshot
  private shouldCreateSnapshot(): boolean {
    // Create a snapshot every 10 messages
    return this.activeMessages.length % 10 === 0 && this.activeMessages.length > 0;
  }

  // Get context window for AI processing
  getContextWindow(): Message[] {
    // Simple implementation: just return all active messages
    // In a real implementation, you might want to limit the context window size
    return this.activeMessages;
  }
}
