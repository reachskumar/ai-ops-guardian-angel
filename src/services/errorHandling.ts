
export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: Error, attempt: number) => boolean;
}

export interface ErrorContext {
  operation: string;
  timestamp: string;
  userAgent?: string;
  url?: string;
  userId?: string;
}

export class RetryableError extends Error {
  constructor(message: string, public isRetryable: boolean = true) {
    super(message);
    this.name = 'RetryableError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class NetworkError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'NetworkError';
  }
}

// Exponential backoff retry utility
export const withRetry = async <T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    shouldRetry = (error: Error) => error instanceof RetryableError || error instanceof NetworkError
  } = options;

  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on last attempt or if error shouldn't be retried
      if (attempt === maxAttempts || !shouldRetry(error, attempt)) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        baseDelay * Math.pow(backoffMultiplier, attempt - 1),
        maxDelay
      );

      // Add jitter to prevent thundering herd
      const jitteredDelay = delay + Math.random() * 1000;

      console.warn(`Operation failed, retrying in ${jitteredDelay}ms. Attempt ${attempt}/${maxAttempts}:`, error);
      
      await new Promise(resolve => setTimeout(resolve, jitteredDelay));
    }
  }

  throw lastError;
};

// Error logging utility
export const logError = (error: Error, context: ErrorContext): void => {
  const errorLog = {
    message: error.message,
    name: error.name,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString()
  };

  console.error('Error logged:', errorLog);
  
  // In production, you might want to send this to an error tracking service
  // like Sentry, LogRocket, or Rollbar
};

// Network error detection
export const isNetworkError = (error: any): boolean => {
  return (
    error instanceof TypeError ||
    error.message?.includes('fetch') ||
    error.message?.includes('network') ||
    error.code === 'NETWORK_ERROR' ||
    (error.status >= 500 && error.status < 600) ||
    error.status === 408 || // Request Timeout
    error.status === 429    // Too Many Requests
  );
};

// Authentication error detection
export const isAuthError = (error: any): boolean => {
  return (
    error.status === 401 ||
    error.status === 403 ||
    error.message?.includes('unauthorized') ||
    error.message?.includes('authentication') ||
    error.message?.includes('invalid_grant')
  );
};

// Format error messages for user display
export const formatErrorMessage = (error: Error): string => {
  if (error instanceof AuthenticationError) {
    return 'Authentication failed. Please check your credentials and try again.';
  }
  
  if (error instanceof NetworkError) {
    if (error.status === 429) {
      return 'Too many requests. Please wait a moment before trying again.';
    }
    return 'Network error. Please check your connection and try again.';
  }
  
  if (isNetworkError(error)) {
    return 'Connection error. Please check your internet connection.';
  }
  
  // Default fallback
  return error.message || 'An unexpected error occurred. Please try again.';
};
