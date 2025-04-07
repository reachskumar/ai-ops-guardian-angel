
import { supabase } from "@/integrations/supabase/client";
import { mockInsert, mockSelect, mockUpdate, mockDelete } from "./mockDatabaseService";

export type NotificationType = 'incident' | 'alert' | 'system' | 'resource' | 'user' | 'security' | 'infrastructure' | 'monitoring';

export type NotificationPriority = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface Notification {
  id: string;
  user_id: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  related_id?: string;
  related_type?: string;
  read: boolean;
  created_at: string;
  metadata?: Record<string, any>;
}

// Get notifications for a user
export const getNotifications = async (
  userId: string,
  options?: {
    unreadOnly?: boolean;
    limit?: number;
    offset?: number;
  }
): Promise<{ notifications: Notification[]; count: number }> => {
  try {
    const { unreadOnly = false, limit = 20, offset = 0 } = options || {};
    
    // Create filters
    const filters: Record<string, any> = { user_id: userId };
    if (unreadOnly) filters.read = false;
    
    // Use mock service instead of Supabase
    const { data, count, error } = mockSelect('notifications', filters);
    
    // Manually handle pagination
    const paginatedData = data.slice(offset, offset + limit);
    
    if (error) throw error;
    
    return {
      notifications: paginatedData as Notification[],
      count: count
    };
  } catch (error) {
    console.error("Get notifications error:", error);
    return { notifications: [], count: 0 };
  }
};

// Create a new notification
export const createNotification = async (
  notification: Omit<Notification, 'id' | 'created_at'>
): Promise<{ success: boolean; notificationId?: string; error?: string }> => {
  try {
    // Use mock service
    const { data, error } = mockInsert('notifications', notification);
    
    if (error) throw error;
    
    return { 
      success: true, 
      notificationId: data?.[0]?.id
    };
  } catch (error: any) {
    console.error("Create notification error:", error);
    return { success: false, error: error.message };
  }
};

// Mark a notification as read
export const markNotificationAsRead = async (
  notificationId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Use mock service
    const { error } = mockUpdate('notifications', notificationId, { read: true });
    
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error("Mark as read error:", error);
    return { success: false, error: error.message };
  }
};

// Mark all notifications as read for a user
export const markAllNotificationsAsRead = async (
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Get all notifications for the user
    const { data: notifications, error: selectError } = mockSelect('notifications', { user_id: userId });
    if (selectError) throw selectError;
    
    // Update each notification to mark as read
    for (const notification of notifications) {
      await mockUpdate('notifications', notification.id, { read: true });
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Mark all as read error:", error);
    return { success: false, error: error.message };
  }
};

// Delete a notification
export const deleteNotification = async (
  notificationId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Use mock service
    const { error } = mockDelete('notifications', notificationId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error("Delete notification error:", error);
    return { success: false, error: error.message };
  }
};

// Set up notification listener with real-time capabilities
export const setupNotificationListener = (
  userId: string, 
  callback: (notification: Notification) => void
): (() => void) => {
  console.log(`Setting up notification listener for user ${userId}`);
  
  // In a real implementation with Supabase, we would set up like this:
  const channel = supabase
    .channel('public:notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT', 
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        console.log('New notification received:', payload);
        callback(payload.new as Notification);
      }
    )
    .subscribe();
  
  // Return cleanup function
  return () => {
    console.log(`Cleaning up notification listener for user ${userId}`);
    supabase.removeChannel(channel);
  };
};

// Subscribe user to push notifications
export const subscribePushNotifications = async (
  userId: string,
  subscription: PushSubscription
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Extract necessary data from PushSubscription object
    const subscriptionData = {
      user_id: userId,
      endpoint: subscription.endpoint,
      // Fix for PushSubscription keys property
      keys: {
        p256dh: "mock-p256dh-key",  // In a real implementation, get from subscription.keys
        auth: "mock-auth-key"        // In a real implementation, get from subscription.keys
      }
    };
    
    // Store the subscription in the database
    const { error } = mockInsert('push_subscriptions', {
      ...subscriptionData,
      keys: JSON.stringify(subscriptionData.keys)
    });
    
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error("Subscribe push notifications error:", error);
    return { success: false, error: error.message };
  }
};

// Unsubscribe user from push notifications
export const unsubscribePushNotifications = async (
  userId: string,
  endpoint: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Delete the subscription from the database
    const { error } = mockDelete('push_subscriptions', endpoint);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error("Unsubscribe push notifications error:", error);
    return { success: false, error: error.message };
  }
};

// Initialize real-time features for notifications
export const initializeRealtimeNotifications = (): void => {
  // Enable realtime functionality for notifications table in a real implementation
  // In a Supabase implementation, this would be:
  // await supabase.rpc('enable_realtime', { table_name: 'notifications' })
  console.log("Realtime notifications initialized");
};
