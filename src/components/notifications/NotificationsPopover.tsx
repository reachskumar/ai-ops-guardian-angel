
import React, { useState, useEffect } from "react";
import { Bell, Check, Trash2, Loader2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/providers/AuthProvider";
import { 
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  setupNotificationListener,
  Notification,
  NotificationType,
  NotificationPriority
} from "@/services/notificationService";
import { toast } from "@/hooks/use-toast";

const NotificationsPopover: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  
  const { user } = useAuth();
  
  // Load notifications
  useEffect(() => {
    const loadNotifications = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const { notifications: notifs } = await getNotifications(user.id, { limit: 10 });
        setNotifications(notifs);
        setUnreadCount(notifs.filter(n => !n.read).length);
      } catch (error) {
        console.error("Failed to load notifications:", error);
        toast({
          title: "Error",
          description: "Failed to load notifications",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      loadNotifications();
    }
  }, [user]);
  
  // Set up real-time notification listener
  useEffect(() => {
    if (!user) return;
    
    const cleanup = setupNotificationListener(user.id, (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      
      toast({
        title: notification.title,
        description: notification.message
      });
    });
    
    return cleanup;
  }, [user]);
  
  // Mark notification as read
  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) => 
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive"
      });
    }
  };
  
  // Mark all as read
  const handleMarkAllAsRead = async () => {
    if (!user) return;
    
    try {
      await markAllNotificationsAsRead(user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      toast({
        title: "Success",
        description: "All notifications marked as read"
      });
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive"
      });
    }
  };
  
  // Delete notification
  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id);
      const deleted = notifications.find((n) => n.id === id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (deleted && !deleted.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      toast({
        title: "Success",
        description: "Notification deleted"
      });
    } catch (error) {
      console.error("Failed to delete notification:", error);
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive"
      });
    }
  };
  
  // Get notification icon based on type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'security':
        return <div className="h-2 w-2 rounded-full bg-red-500 mr-2" />;
      case 'infrastructure':
        return <div className="h-2 w-2 rounded-full bg-blue-500 mr-2" />;
      case 'monitoring':
        return <div className="h-2 w-2 rounded-full bg-green-500 mr-2" />;
      case 'incident':
        return <div className="h-2 w-2 rounded-full bg-orange-500 mr-2" />;
      case 'alert':
        return <div className="h-2 w-2 rounded-full bg-yellow-500 mr-2" />;
      case 'system':
        return <div className="h-2 w-2 rounded-full bg-purple-500 mr-2" />;
      case 'resource':
        return <div className="h-2 w-2 rounded-full bg-indigo-500 mr-2" />;
      case 'user':
        return <div className="h-2 w-2 rounded-full bg-gray-500 mr-2" />;
      default:
        return <div className="h-2 w-2 rounded-full bg-gray-500 mr-2" />;
    }
  };
  
  // Get notification badge based on priority
  const getNotificationBadge = (priority: NotificationPriority) => {
    switch (priority) {
      case 'critical':
        return <Badge className="ml-auto" variant="destructive">Critical</Badge>;
      case 'high':
        return <Badge className="ml-auto bg-orange-500">High</Badge>;
      case 'medium':
        return <Badge className="ml-auto bg-yellow-500">Medium</Badge>;
      case 'low':
        return <Badge className="ml-auto bg-green-500">Low</Badge>;
      default:
        return <Badge className="ml-auto bg-secondary text-secondary-foreground">Info</Badge>;
    }
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 pb-2">
          <h4 className="font-medium">Notifications</h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} className="h-auto py-1 px-2 text-xs">
              Mark all as read
            </Button>
          )}
        </div>
        <Separator />
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p>No notifications</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-4 border-b last:border-b-0 ${!notification.read ? 'bg-accent/50' : ''}`}
              >
                <div className="flex items-start">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{notification.title}</p>
                    <p className="text-muted-foreground text-xs line-clamp-2 mt-1">
                      {notification.message}
                    </p>
                    <div className="flex items-center mt-2">
                      <p className="text-xs text-muted-foreground">
                        {new Date(notification.created_at).toLocaleTimeString()}
                      </p>
                      {getNotificationBadge(notification.priority)}
                    </div>
                  </div>
                </div>
                {!notification.read && (
                  <div className="flex justify-end gap-2 mt-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-7 w-7" 
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-7 w-7" 
                      onClick={() => handleDelete(notification.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsPopover;
