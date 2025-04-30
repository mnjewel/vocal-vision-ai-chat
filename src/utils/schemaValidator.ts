import { z } from 'zod';
import { createValidationError } from './errorHandler';

/**
 * Message schema validation
 */
export const MessageSchema = z.object({
  id: z.string().uuid(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  session_id: z.string().uuid(),
  created_at: z.string().optional().nullable()
});

export type MessageSchemaType = z.infer<typeof MessageSchema>;

/**
 * Chat session schema validation
 */
export const ChatSessionSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  user_id: z.string().uuid(),
  model: z.string().optional(),
  created_at: z.string().optional().nullable(),
  updated_at: z.string().optional().nullable()
});

export type ChatSessionSchemaType = z.infer<typeof ChatSessionSchema>;

/**
 * Validate message data before database operations
 */
export function validateMessage(data: unknown): MessageSchemaType {
  try {
    return MessageSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw createValidationError(`Invalid message data: ${errorMessage}`);
    }
    throw createValidationError('Invalid message data');
  }
}

/**
 * Validate chat session data before database operations
 */
export function validateChatSession(data: unknown): ChatSessionSchemaType {
  try {
    return ChatSessionSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw createValidationError(`Invalid chat session data: ${errorMessage}`);
    }
    throw createValidationError('Invalid chat session data');
  }
}

/**
 * Create a partial validator for updates
 */
export function validatePartialChatSession(data: unknown): Partial<ChatSessionSchemaType> {
  try {
    return ChatSessionSchema.partial().parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw createValidationError(`Invalid chat session update data: ${errorMessage}`);
    }
    throw createValidationError('Invalid chat session update data');
  }
}

/**
 * Create a partial validator for message updates
 */
export function validatePartialMessage(data: unknown): Partial<MessageSchemaType> {
  try {
    return MessageSchema.partial().parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw createValidationError(`Invalid message update data: ${errorMessage}`);
    }
    throw createValidationError('Invalid message update data');
  }
}
