import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { dbStore } from '../services/dataStore';

export const getNotifications = async (req: AuthRequest, res: Response) => {
  const userId = req.user?._id;
  const notifications = dbStore.getNotifications(userId);
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  return res.json({ success: true, count: notifications.length, unreadCount, notifications });
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const notif = dbStore.notifications.find((n) => n._id === id);
  if (!notif || (notif.userId !== req.user?._id && notif.userId !== 'all')) {
    return res.status(404).json({ success: false, message: 'Notification not found' });
  }
  if (notif.userId === req.user?._id) notif.isRead = true;
  return res.json({ success: true, message: 'Notification marked as read' });
};
