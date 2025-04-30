import { toast } from 'sonner';

/**
 * Error types for better error handling
 */
export enum ErrorType {
  API_ERROR = 'API_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Custom error class with type
 */
export class AppError extends Error {
  type: ErrorType;
  
  constructor(message: string, type: ErrorType = ErrorType.UNKNOWN_ERROR) {
    super(message);
    this.type = type;
    this.name = 'AppError';
  }
}

/**
 * Function to handle errors in a consistent way
 */
export function handleError(error: unknown, defaultMessage: string = 'An error occurred'): void {
  console.error('Error:', error);
  
  let errorMessage = defaultMessage;
  let errorType = ErrorType.UNKNOWN_ERROR;
  
  if (error instanceof AppError) {
    errorMessage = error.message;
    errorType = error.type;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }
  
  // Log to console with more details
  console.error(`Error (${errorType}):`, errorMessage);
  
  // Show user-friendly toast
  toast.error(errorMessage);
}

/**
 * Utility function to safely execute async functions with error handling
 */
export async function safeAsync<T>(
  asyncFn: () => Promise<T>,
  errorMessage: string = 'Operation failed'
): Promise<T | null> {
  try {
    return await asyncFn();
  } catch (error) {
    handleError(error, errorMessage);
    return null;
  }
}

/**
 * Create specific error types
 */
export function createApiError(message: string): AppError {
  return new AppError(message, ErrorType.API_ERROR);
}

export function createNetworkError(message: string): AppError {
  return new AppError(message, ErrorType.NETWORK_ERROR);
}

export function createAuthError(message: string): AppError {
  return new AppError(message, ErrorType.AUTH_ERROR);
}

export function createDatabaseError(message: string): AppError {
  return new AppError(message, ErrorType.DATABASE_ERROR);
}

export function createValidationError(message: string): AppError {
  return new AppError(message, ErrorType.VALIDATION_ERROR);
}
