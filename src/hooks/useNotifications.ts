import { useState, useEffect, useCallback } from 'react';
import { Notification, Task } from '@/types';
import { useToast } from '@/hooks/use-toast';

export function useNotifications(tasks: Task[]) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { toast } = useToast();

  // Check for upcoming deadlines and create notifications
  const checkDeadlines = useCallback(() => {
    const now = new Date();
    const newNotifications: Notification[] = [];

    tasks.forEach(task => {
      if (task.completed) return;

      const timeUntilDue = task.dueDate.getTime() - now.getTime();
      const hoursUntilDue = timeUntilDue / (1000 * 60 * 60);
      const daysUntilDue = timeUntilDue / (1000 * 60 * 60 * 24);

      // Create notifications for tasks due soon
      if (hoursUntilDue <= 24 && hoursUntilDue > 0) {
        const existingNotification = notifications.find(
          n => n.taskId === task.id && n.type === 'deadline'
        );

        if (!existingNotification) {
          newNotifications.push({
            id: `deadline-${task.id}-${Date.now()}`,
            title: 'Assignment Due Soon!',
            message: `${task.title} is due ${daysUntilDue < 1 ? 'today' : 'tomorrow'}`,
            type: 'deadline',
            taskId: task.id,
            date: now,
            read: false
          });
        }
      }

      // Create overdue notifications
      if (timeUntilDue < 0) {
        const existingOverdueNotification = notifications.find(
          n => n.taskId === task.id && n.type === 'deadline' && n.message.includes('overdue')
        );

        if (!existingOverdueNotification) {
          newNotifications.push({
            id: `overdue-${task.id}-${Date.now()}`,
            title: 'Task Overdue!',
            message: `${task.title} is ${Math.abs(Math.ceil(daysUntilDue))} days overdue`,
            type: 'deadline',
            taskId: task.id,
            date: now,
            read: false
          });
        }
      }

      // Custom reminder notifications
      if (task.reminderTime && task.reminderTime <= now) {
        const existingReminder = notifications.find(
          n => n.taskId === task.id && n.type === 'reminder'
        );

        if (!existingReminder) {
          newNotifications.push({
            id: `reminder-${task.id}-${Date.now()}`,
            title: 'Task Reminder',
            message: `Don't forget: ${task.title}`,
            type: 'reminder',
            taskId: task.id,
            date: now,
            read: false
          });
        }
      }
    });

    if (newNotifications.length > 0) {
      setNotifications(prev => [...prev, ...newNotifications]);
      
      // Show toast notifications for the most urgent ones
      newNotifications.slice(0, 3).forEach(notification => {
        toast({
          title: notification.title,
          description: notification.message,
          variant: notification.type === 'deadline' ? 'destructive' : 'default',
        });
      });
    }
  }, [tasks, notifications, toast]);

  // Check for deadlines every minute
  useEffect(() => {
    checkDeadlines();
    const interval = setInterval(checkDeadlines, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [checkDeadlines]);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  const dismissNotification = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    );
  }, []);

  const createNotification = useCallback((notification: Omit<Notification, 'id' | 'date'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `custom-${Date.now()}`,
      date: new Date()
    };
    setNotifications(prev => [...prev, newNotification]);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    markAsRead,
    dismissNotification,
    createNotification
  };
}