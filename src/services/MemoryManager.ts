import { supabase } from '@/integrations/supabase/client';
import { Message, MessageRole } from '@/hooks/useChat';
import { v4 as uuidv4 } from 'uuid';
import { createGroqChatCompletion } from '@/integrations/groq/service';

interface MemoryOptions {
  maxContextSize?: number;
  includeSystemPrompts?: boolean;
  longTermMemoryEnabled?: boolean;
  summarizationThreshold?: number;
}

interface MemorySnapshot {
  id: string;
  sessionId: string;
  summary: string;
  timestamp: Date;
  messageIds: string[];
}

interface ConversationBranch {
  id: string;
  parentId: string;
  createdAt: Date;
  title: string;
}

export class MemoryManager {
  sessionId: string;
  activeMessages: Message[] = [];
  memorySnapshots: MemorySnapshot[] = [];
  branches: ConversationBranch[] = [];
  options: MemoryOptions = {
    maxContextSize: 20,
    includeSystemPrompts: true,
    longTermMemoryEnabled: true,
    summarizationThreshold: 10
  };
  localStorageKey: string;

  constructor(sessionId?: string, options?: Partial<MemoryOptions>) {
    this.sessionId = sessionId || uuidv4();
    this.options = { ...this.options, ...options };
    this.localStorageKey = `memory_${this.sessionId}`;
    this.loadFromLocalStorage();
  }

  /**
   * Save a message to memory and persist it
   */
  async saveMessage(message: Message): Promise<void> {
    try {
      // Add message to local memory
      this.activeMessages.push(message);

      // Save to local storage
      this.saveToLocalStorage();

      // Check if we need to create a memory snapshot
      if (this.options.longTermMemoryEnabled &&
          this.getMessageCountSinceLastSnapshot() >= this.options.summarizationThreshold!) {
        await this.createMemorySnapshot();
      }

      // Skip Supabase saving if user is not logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Save to Supabase if user is authenticated
      await supabase.from('messages').insert({
        id: message.id,
        session_id: this.sessionId,
        role: message.role,
        content: message.content,
        model: message.model || null,
        image_url: message.imageUrl || null,
        metadata: message.metadata ? JSON.stringify(message.metadata) : null,
        created_at: message.timestamp.toISOString()
      });
    } catch (error) {
      console.error('Error saving message to memory:', error);
    }
  }

  /**
   * Load messages for a specific session
   */
  async loadSessionMessages(sessionId: string): Promise<Message[]> {
    try {
      this.sessionId = sessionId;
      this.localStorageKey = `memory_${sessionId}`;

      // Try to load from local storage first
      const localMessages = this.loadFromLocalStorage();
      if (localMessages.length > 0) {
        return localMessages;
      }

      // If not in local storage, try to load from Supabase
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
        role: msg.role as MessageRole,
        content: msg.content,
        timestamp: new Date(msg.created_at),
        model: msg.model || undefined,
        imageUrl: msg.image_url || undefined,
        metadata: msg.metadata ? JSON.parse(msg.metadata) : undefined
      }));

      this.activeMessages = messages;
      this.saveToLocalStorage();

      // Load branches
      await this.loadBranches();

      return messages;
    } catch (error) {
      console.error('Error loading session messages:', error);
      return [];
    }
  }

  /**
   * Get the current context window for AI processing
   */
  getContextWindow(includeSystem: boolean = true): Message[] {
    let context = [...this.activeMessages];

    // Optionally exclude system messages
    if (!includeSystem) {
      context = context.filter(msg => msg.role !== 'system');
    }

    // If context is too large, use memory snapshots and recent messages
    if (context.length > this.options.maxContextSize! && this.memorySnapshots.length > 0) {
      const systemMessages = includeSystem ? context.filter(msg => msg.role === 'system') : [];
      const nonSystemMessages = context.filter(msg => msg.role !== 'system');

      // Get the most recent memory snapshot
      const latestSnapshot = this.memorySnapshots[this.memorySnapshots.length - 1];

      // Create a summary message from the snapshot
      const summaryMessage: Message = {
        id: `summary_${latestSnapshot.id}`,
        role: 'system',
        content: `Previous conversation summary: ${latestSnapshot.summary}`,
        timestamp: latestSnapshot.timestamp
      };

      // Get messages after the snapshot
      const messagesAfterSnapshot = nonSystemMessages.filter(
        msg => !latestSnapshot.messageIds.includes(msg.id)
      );

      // Calculate how many recent messages we can include
      const availableSlots = this.options.maxContextSize! - systemMessages.length - 1; // -1 for summary
      const recentMessages = messagesAfterSnapshot.slice(-1 * availableSlots);

      // Combine system messages, summary, and recent messages
      context = [...systemMessages, summaryMessage, ...recentMessages];
    } else if (context.length > this.options.maxContextSize!) {
      // If no snapshots available, just use recent messages
      const systemMessages = includeSystem ? context.filter(msg => msg.role === 'system') : [];
      const nonSystemMessages = context.filter(msg => msg.role !== 'system');

      // Get the most recent messages to fit within the context window
      const recentMessages = nonSystemMessages.slice(-1 * (this.options.maxContextSize! - systemMessages.length));

      // Combine system messages with recent messages
      context = [...systemMessages, ...recentMessages];
    }

    return context;
  }

  /**
   * Create an AI-generated summary of the conversation
   */
  async summarizeContext(): Promise<string> {
    try {
      // If we have fewer than 3 messages, return a simple summary
      if (this.activeMessages.length < 3) {
        return `Conversation with ${this.activeMessages.filter(m => m.role === 'user').length} user messages`;
      }

      // Create a prompt for the AI to summarize the conversation
      const messagesToSummarize = this.activeMessages.slice(-Math.min(10, this.activeMessages.length));
      const conversationText = messagesToSummarize.map(msg =>
        `${msg.role.toUpperCase()}: ${msg.content}`
      ).join('\n\n');

      const summaryPrompt = [
        {
          role: 'system',
          content: 'You are a helpful assistant that summarizes conversations concisely. Create a brief summary (50 words max) that captures the key points of this conversation.'
        },
        {
          role: 'user',
          content: `Please summarize this conversation:\n\n${conversationText}`
        }
      ];

      // Use Groq API to generate summary
      const response = await createGroqChatCompletion({
        messages: summaryPrompt,
        model: 'llama-3.1-8b-instant',
        max_tokens: 100
      });

      return response.content || `Conversation with ${this.activeMessages.filter(m => m.role === 'user').length} user messages`;
    } catch (error) {
      console.error('Error summarizing context:', error);
      return `Conversation with ${this.activeMessages.filter(m => m.role === 'user').length} user messages`;
    }
  }

  /**
   * Create a memory snapshot for long-term memory
   */
  async createMemorySnapshot(): Promise<void> {
    try {
      // Generate a summary of the conversation
      const summary = await this.summarizeContext();

      // Create a snapshot
      const snapshot: MemorySnapshot = {
        id: uuidv4(),
        sessionId: this.sessionId,
        summary,
        timestamp: new Date(),
        messageIds: this.activeMessages.map(m => m.id)
      };

      // Add to memory snapshots
      this.memorySnapshots.push(snapshot);
      this.saveToLocalStorage();

      // Save to Supabase if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.from('memory_snapshots').insert({
          id: snapshot.id,
          session_id: this.sessionId,
          summary: summary,
          timestamp: snapshot.timestamp.toISOString(),
          message_ids: JSON.stringify(snapshot.messageIds),
          user_id: session.user.id
        });
      }
    } catch (error) {
      console.error('Error creating memory snapshot:', error);
    }
  }

  /**
   * Create a new branch from the current conversation
   */
  async createBranch(): Promise<string> {
    // Create a new session based on the current context
    const newSessionId = uuidv4();

    try {
      // Create a branch record
      const branch: ConversationBranch = {
        id: newSessionId,
        parentId: this.sessionId,
        createdAt: new Date(),
        title: `Branch from ${this.sessionId}`
      };

      // Add to branches
      this.branches.push(branch);

      // Skip Supabase operations if user is not logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return newSessionId;

      // Create a new session entry
      await supabase.from('chat_sessions').insert({
        id: newSessionId,
        title: `Branch from ${this.sessionId}`,
        created_at: new Date().toISOString(),
        user_id: session.user.id,
        parent_id: this.sessionId
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
      console.error('Error creating branch:', error);
      return newSessionId;
    }
  }

  /**
   * Load branches for the current session
   */
  async loadBranches(): Promise<ConversationBranch[]> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

      // Get branches where this session is the parent
      const { data: childBranches, error: childError } = await supabase
        .from('chat_sessions')
        .select('id, created_at, title')
        .eq('parent_id', this.sessionId);

      if (childError) throw childError;

      // Get parent branch if this session is a branch
      const { data: parentBranch, error: parentError } = await supabase
        .from('chat_sessions')
        .select('id, created_at, title')
        .eq('id', this.sessionId)
        .not('parent_id', 'is', null)
        .single();

      if (parentError && parentError.code !== 'PGRST116') throw parentError;

      // Format branches
      const branches: ConversationBranch[] = [];

      if (childBranches) {
        childBranches.forEach(branch => {
          branches.push({
            id: branch.id,
            parentId: this.sessionId,
            createdAt: new Date(branch.created_at),
            title: branch.title
          });
        });
      }

      if (parentBranch) {
        const { data: parent, error } = await supabase
          .from('chat_sessions')
          .select('id, created_at, title')
          .eq('id', parentBranch.parent_id)
          .single();

        if (!error && parent) {
          branches.push({
            id: parent.id,
            parentId: '',
            createdAt: new Date(parent.created_at),
            title: parent.title
          });
        }
      }

      this.branches = branches;
      return branches;
    } catch (error) {
      console.error('Error loading branches:', error);
      return [];
    }
  }

  /**
   * Get the number of messages since the last snapshot
   */
  private getMessageCountSinceLastSnapshot(): number {
    if (this.memorySnapshots.length === 0) {
      return this.activeMessages.length;
    }

    const lastSnapshot = this.memorySnapshots[this.memorySnapshots.length - 1];
    return this.activeMessages.filter(msg => !lastSnapshot.messageIds.includes(msg.id)).length;
  }

  /**
   * Save memory state to localStorage
   */
  private saveToLocalStorage(): void {
    try {
      const memoryState = {
        sessionId: this.sessionId,
        activeMessages: this.activeMessages,
        memorySnapshots: this.memorySnapshots,
        branches: this.branches
      };

      localStorage.setItem(this.localStorageKey, JSON.stringify(memoryState));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  /**
   * Load memory state from localStorage
   */
  private loadFromLocalStorage(): Message[] {
    try {
      const memoryStateJson = localStorage.getItem(this.localStorageKey);
      if (!memoryStateJson) return [];

      const memoryState = JSON.parse(memoryStateJson);

      this.sessionId = memoryState.sessionId;
      this.activeMessages = memoryState.activeMessages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));

      this.memorySnapshots = memoryState.memorySnapshots?.map((snapshot: any) => ({
        ...snapshot,
        timestamp: new Date(snapshot.timestamp)
      })) || [];

      this.branches = memoryState.branches?.map((branch: any) => ({
        ...branch,
        createdAt: new Date(branch.createdAt)
      })) || [];

      return this.activeMessages;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return [];
    }
  }

  /**
   * Search through messages in the current session
   */
  searchMessages(query: string): Message[] {
    if (!query.trim()) return [];

    const normalizedQuery = query.toLowerCase().trim();

    return this.activeMessages.filter(message =>
      message.content.toLowerCase().includes(normalizedQuery)
    );
  }

  /**
   * Delete a message from memory
   */
  async deleteMessage(messageId: string): Promise<void> {
    try {
      // Remove from active messages
      this.activeMessages = this.activeMessages.filter(msg => msg.id !== messageId);

      // Update memory snapshots
      this.memorySnapshots.forEach(snapshot => {
        snapshot.messageIds = snapshot.messageIds.filter(id => id !== messageId);
      });

      // Save to local storage
      this.saveToLocalStorage();

      // Delete from Supabase if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.from('messages').delete().eq('id', messageId);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  }
}
