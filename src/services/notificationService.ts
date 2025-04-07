
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
  title: string; // Added title field to match component usage
  related_id?: string; // Reference to the related item (incident, alert, etc.)
  related_type?: string;
  read: boolean;
  created_at: string;
  metadata?: Record<string, any>;
}

// Get notifications for a user - renamed to match component usage
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

// Mark a notification as read - renamed to match component usage
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

// Mark all notifications as read for a user - renamed to match component usage
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

// Set up notification listener - added to match component usage
export const setupNotificationListener = (
  userId: string, 
  callback: (notification: Notification) => void
): (() => void) => {
  // Mock listener implementation
  console.log(`Setting up notification listener for user ${userId}`);
  
  // Return cleanup function
  return () => {
    console.log(`Cleaning up notification listener for user ${userId}`);
  };
};

// Subscribe user to push notifications
export const subscribePushNotifications = async (
  userId: string,
  subscription: PushSubscription
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Store the subscription in the database
    const { error } = mockInsert('push_subscriptions', {
      user_id: userId,
      endpoint: subscription.endpoint,
      // Fix for PushSubscription keys property
      keys: JSON.stringify({
        p256dh: "mock-p256dh-key",
        auth: "mock-auth-key"
      })
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
