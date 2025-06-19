
import { 
  withRetry, 
  RetryableError, 
  NetworkError,
  logError,
  isNetworkError,
  formatErrorMessage
} from './errorHandling';
import { 
  createNotification, 
  getNotifications, 
  markNotificationAsRead,
  NotificationType,
  NotificationPriority,
  Notification
} from './notificationService';

export class EnhancedNotificationService {
  // Enhanced notification creation with retry logic
  async createNotificationWithRetry(
    notification: Omit<Notification, 'id' | 'created_at'>
  ): Promise<{ success: boolean; notificationId?: string; error?: string }> {
    return withRetry(async () => {
      try {
        const result = await createNotification(notification);
        
        if (!result.success) {
          if (result.error?.includes('network') || result.error?.includes('timeout')) {
            throw new NetworkError(result.error);
          }
          throw new RetryableError(result.error || 'Failed to create notification');
        }
        
        return result;
      } catch (error: any) {
        logError(error, {
          operation: 'createNotification',
          timestamp: new Date().toISOString(),
          userId: notification.user_id
        });
        
        throw error;
      }
    }, {
      maxAttempts: 3,
      baseDelay: 1000,
      shouldRetry: (error) => error instanceof NetworkError || error instanceof RetryableError
    });
  }

  // Enhanced notification fetching with error handling
  async getNotificationsWithRetry(
    userId: string,
    options?: {
      unreadOnly?: boolean;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ notifications: Notification[]; count: number; error?: string }> {
    return withRetry(async () => {
      try {
        const result = await getNotifications(userId, options);
        return { ...result, error: undefined };
      } catch (error: any) {
        logError(error, {
          operation: 'getNotifications',
          timestamp: new Date().toISOString(),
          userId
        });

        if (isNetworkError(error)) {
          throw new NetworkError(error.message);
        }
        throw new RetryableError(error.message);
      }
    }, {
      maxAttempts: 3,
      baseDelay: 1000
    }).catch(error => ({
      notifications: [],
      count: 0,
      error: formatErrorMessage(error)
    }));
  }

  // Enhanced mark as read with retry
  async markAsReadWithRetry(notificationId: string): Promise<{ success: boolean; error?: string }> {
    return withRetry(async () => {
      try {
        const result = await markNotificationAsRead(notificationId);
        
        if (!result.success) {
          if (result.error?.includes('network') || result.error?.includes('timeout')) {
            throw new NetworkError(result.error);
          }
          throw new RetryableError(result.error || 'Failed to mark notification as read');
        }
        
        return result;
      } catch (error: any) {
        logError(error, {
          operation: 'markNotificationAsRead',
          timestamp: new Date().toISOString()
        });
        
        throw error;
      }
    }, {
      maxAttempts: 3,
      baseDelay: 500
    }).catch(error => ({
      success: false,
      error: formatErrorMessage(error)
    }));
  }

  // Batch operations with error handling
  async createBulkNotifications(
    notifications: Omit<Notification, 'id' | 'created_at'>[]
  ): Promise<{ success: boolean; successCount: number; errors: string[] }> {
    const results = await Promise.allSettled(
      notifications.map(notification => this.createNotificationWithRetry(notification))
    );

    let successCount = 0;
    const errors: string[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.success) {
        successCount++;
      } else {
        const error = result.status === 'rejected' 
          ? result.reason.message 
          : result.value.error;
        errors.push(`Notification ${index + 1}: ${error}`);
      }
    });

    return {
      success: successCount === notifications.length,
      successCount,
      errors
    };
  }

  // Enhanced notification with fallback mechanisms
  async notifyWithFallback(
    notification: Omit<Notification, 'id' | 'created_at'>,
    fallbackMethods?: Array<'toast' | 'console' | 'localStorage'>
  ): Promise<{ success: boolean; method: string; error?: string }> {
    // Try primary notification method
    const primaryResult = await this.createNotificationWithRetry(notification);
    
    if (primaryResult.success) {
      return { success: true, method: 'database' };
    }

    // Try fallback methods
    if (fallbackMethods?.includes('toast')) {
      try {
        // Import toast dynamically to avoid circular dependencies
        const { toast } = await import('@/hooks/use-toast');
        toast({
          title: notification.title,
          description: notification.message,
          variant: notification.priority === 'critical' ? 'destructive' : 'default'
        });
        return { success: true, method: 'toast' };
      } catch (error: any) {
        console.warn('Toast fallback failed:', error);
      }
    }

    if (fallbackMethods?.includes('localStorage')) {
      try {
        const existingNotifications = JSON.parse(
          localStorage.getItem('fallback_notifications') || '[]'
        );
        existingNotifications.push({
          ...notification,
          id: Date.now().toString(),
          created_at: new Date().toISOString()
        });
        localStorage.setItem('fallback_notifications', JSON.stringify(existingNotifications));
        return { success: true, method: 'localStorage' };
      } catch (error: any) {
        console.warn('localStorage fallback failed:', error);
      }
    }

    if (fallbackMethods?.includes('console')) {
      console.warn('Notification fallback to console:', {
        title: notification.title,
        message: notification.message,
        priority: notification.priority
      });
      return { success: true, method: 'console' };
    }

    return { 
      success: false, 
      method: 'none', 
      error: primaryResult.error || 'All notification methods failed' 
    };
  }
}

export const enhancedNotificationService = new EnhancedNotificationService();
