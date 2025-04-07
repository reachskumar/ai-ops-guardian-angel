
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type NotificationPriority = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type NotificationType = 'security' | 'infrastructure' | 'monitoring' | 'incident' | 'system';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  read: boolean;
  created_at: string;
  link?: string;
  metadata?: Record<string, any>;
}

export const getNotifications = async (
  userId: string, 
  options?: { 
    limit?: number; 
    offset?: number; 
    onlyUnread?: boolean;
    type?: NotificationType;
  }
): Promise<{ notifications: Notification[]; count: number }> => {
  try {
    const { limit = 10, offset = 0, onlyUnread, type } = options || {};
    
    // Start building the query
    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    // Optional filters
    if (onlyUnread) {
      query = query.eq('read', false);
    }
    
    if (type) {
      query = query.eq('type', type);
    }
    
    // Execute the query
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    return { 
      notifications: data as Notification[], 
      count: count || 0 
    };
  } catch (error) {
    console.error("Get notifications error:", error);
    return { notifications: [], count: 0 };
  }
};

export const createNotification = async (
  notification: Omit<Notification, 'id' | 'created_at'>
): Promise<{ success: boolean; notificationId?: string; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select();
    
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

export const markNotificationAsRead = async (
  notificationId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error("Mark notification as read error:", error);
    return { success: false, error: error.message };
  }
};

export const markAllNotificationsAsRead = async (
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error("Mark all notifications as read error:", error);
    return { success: false, error: error.message };
  }
};

export const deleteNotification = async (
  notificationId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error("Delete notification error:", error);
    return { success: false, error: error.message };
  }
};

export const subscribeToPushNotifications = async (
  userId: string, 
  subscription: PushSubscription
): Promise<{ success: boolean; error?: string }> => {
  try {
    // This would typically send the subscription to your server
    // to store and use for sending push notifications
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: userId,
        endpoint: subscription.endpoint,
        p256dh: btoa(JSON.stringify(subscription.getKey('p256dh'))),
        auth: btoa(JSON.stringify(subscription.getKey('auth'))),
      });
    
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error("Subscribe to push notifications error:", error);
    return { success: false, error: error.message };
  }
};

// Helper function to show a notification toast
export const showNotificationToast = (
  notification: Pick<Notification, 'title' | 'message' | 'priority'>
): void => {
  const variant = 
    notification.priority === 'critical' ? 'destructive' :
    notification.priority === 'high' ? 'destructive' :
    notification.priority === 'medium' ? 'default' :
    notification.priority === 'low' ? 'default' : 'default';

  toast({
    title: notification.title,
    description: notification.message,
    variant,
    duration: notification.priority === 'critical' ? 10000 : 5000,
  });
};

// Setup real-time notifications
export const setupNotificationListener = (
  userId: string, 
  onNewNotification: (notification: Notification) => void
): (() => void) => {
  const channel = supabase
    .channel(`user-notifications-${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        const newNotification = payload.new as Notification;
        onNewNotification(newNotification);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
