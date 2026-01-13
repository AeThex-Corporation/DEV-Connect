
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  MessageSquare,
  Briefcase,
  DollarSign,
  Star,
  CheckCircle,
  X,
  Target, // New icon
  Trophy, // New icon
  Zap, // New icon
  TrendingUp, // New icon
  Filter, // New icon
  Trash2, // New icon
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"; // New imports

export default function NotificationCenter({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupedNotifications, setGroupedNotifications] = useState({}); // New state
  const [activeTab, setActiveTab] = useState('all'); // New state
  const [unreadNotifications, setUnreadNotifications] = useState([]); // New state
  const [unreadCount, setUnreadCount] = useState(0); // New state
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  // Effect to update unread counts and notifications whenever the main notifications list changes
  useEffect(() => {
    const unread = notifications.filter(n => !n.read);
    setUnreadNotifications(unread);
    setUnreadCount(unread.length);

    // Also update grouped notifications here to ensure consistency
    const grouped = {};
    notifications.forEach(notif => {
      const date = new Date(notif.created_date).toLocaleDateString();
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(notif);
    });
    setGroupedNotifications(grouped);
  }, [notifications]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      // The original file already imports base44 statically. Using await import here might be redundant or problematic
      // if base44Client is not designed for dynamic import in this context.
      // Keeping the existing static import and directly using base44.
      const currentUser = await base44.auth.me();
      
      const notifs = await base44.entities.Notification.filter(
        { user_id: currentUser.id },
        "-created_date",
        50
      );
      
      setNotifications(notifs); // This will trigger the useEffect above to group them.
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notifId) => {
    try {
      await base44.entities.Notification.update(notifId, { read: true });
      setNotifications(prev => 
        prev.map(n => n.id === notifId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.read) { // Only mark as read if it's currently unread
      await markAsRead(notif.id);
    }
    if (notif.link) {
      navigate(notif.link);
      onClose();
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      await Promise.all(unreadIds.map(id => 
        base44.entities.Notification.update(id, { read: true })
      ));
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notifId) => {
    try {
      await base44.entities.Notification.delete(notifId);
      setNotifications(prev => prev.filter(n => n.id !== notifId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      'message': <MessageSquare className="w-5 h-5" />,
      'application_update': <Briefcase className="w-5 h-5" />,
      'job_match': <Target className="w-5 h-5" />,
      'escrow_funded': <DollarSign className="w-5 h-5" />,
      'milestone_completed': <CheckCircle className="w-5 h-5" />,
      'payout_requested': <DollarSign className="w-5 h-5" />, // Re-using DollarSign
      'rating_received': <Star className="w-5 h-5" />,
      'collab_room_invite': <Bell className="w-5 h-5" />, // Using Bell for generic
      'collab_room_message': <MessageSquare className="w-5 h-5" />, // Re-using MessageSquare
      'collab_file_shared': <Briefcase className="w-5 h-5" />, // Re-using Briefcase
      'achievement_unlocked': <Trophy className="w-5 h-5" />, // New
      'daily_challenge': <Zap className="w-5 h-5" />, // New
      'level_up': <TrendingUp className="w-5 h-5" /> // New
    };
    return icons[type] || <Bell className="w-5 h-5" />;
  };

  const getNotificationColor = (type) => {
    const colors = {
      'message': 'text-blue-400 bg-blue-500/10',
      'application_update': 'text-purple-400 bg-purple-500/10',
      'job_match': 'text-green-400 bg-green-500/10',
      'escrow_funded': 'text-green-400 bg-green-500/10',
      'milestone_completed': 'text-indigo-400 bg-indigo-500/10',
      'payout_requested': 'text-yellow-400 bg-yellow-500/10', // Re-using yellow
      'rating_received': 'text-yellow-400 bg-yellow-500/10',
      'collab_room_invite': 'text-pink-400 bg-pink-500/10', // Re-using pink
      'collab_room_message': 'text-indigo-400 bg-indigo-500/10', // Re-using indigo
      'collab_file_shared': 'text-teal-400 bg-teal-500/10', // Re-using teal
      'achievement_unlocked': 'text-orange-400 bg-orange-500/10', // New
      'daily_challenge': 'text-pink-400 bg-pink-500/10', // New
      'level_up': 'text-cyan-400 bg-cyan-500/10' // New
    };
    return colors[type] || 'text-gray-400 bg-gray-500/10';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Notification Panel */}
      <div className="relative w-full max-w-md h-full nav-glass shadow-2xl overflow-hidden flex flex-col">
        {/* Header (fixed part: title and close button) */}
        <div className="p-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-lg transition-all text-gray-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs and Content (scrollable area) */}
        <div className="flex-1 overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="glass-card border-0 w-full flex-shrink-0 p-4 pt-0">
              <TabsTrigger value="all" className="flex-1">
                All
                {unreadCount > 0 && (
                  <Badge className="ml-1 bg-indigo-500 text-white border-0 text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="unread" className="flex-1">
                Unread
              </TabsTrigger>
            </TabsList>

            {notifications.length > 0 && (
              <div className="flex gap-2 mt-3 px-4 flex-shrink-0">
                <Button
                  size="sm"
                  onClick={markAllAsRead}
                  className="glass-card border-0 text-white hover:bg-white/5 text-xs"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Mark all read
                </Button>
                <Button
                  size="sm"
                  onClick={() => setActiveTab('unread')}
                  className="glass-card border-0 text-white hover:bg-white/5 text-xs"
                >
                  <Filter className="w-3 h-3 mr-1" />
                  Unread ({unreadCount})
                </Button>
              </div>
            )}

            <TabsContent value="all" className="m-0 flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin w-6 h-6 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
                </div>
              ) : Object.keys(groupedNotifications).length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No notifications yet</p>
                </div>
              ) : (
                Object.entries(groupedNotifications).map(([date, dateNotifs]) => (
                  <div key={date}>
                    <div className="px-4 py-2 bg-white/5 sticky top-0 z-10">
                      <p className="text-gray-400 text-xs font-semibold">{date}</p>
                    </div>
                    {dateNotifs.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`p-4 border-b border-white/5 hover:bg-white/5 transition-all cursor-pointer ${
                          !notification.read ? 'bg-indigo-500/5' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                            {getNotificationIcon(notification.type)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <p className="text-white font-semibold text-sm">
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 mt-1"></div>
                              )}
                            </div>
                            <p className="text-gray-400 text-sm mb-2">{notification.message}</p>
                            <div className="flex items-center justify-between">
                              <p className="text-gray-500 text-xs">
                                {new Date(notification.created_date).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </p>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="p-1 hover:bg-red-500/10 rounded transition-all"
                              >
                                <Trash2 className="w-3 h-3 text-red-400" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="unread" className="m-0 flex-1 overflow-y-auto">
              {loading ? (
                  <div className="flex items-center justify-center py-12">
                      <div className="animate-spin w-6 h-6 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
                  </div>
              ) : unreadNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <p className="text-gray-400">All caught up!</p>
                </div>
              ) : (
                unreadNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className="p-4 border-b border-white/5 hover:bg-white/5 transition-all cursor-pointer bg-indigo-500/5"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-white font-semibold text-sm">
                            {notification.title}
                          </p>
                          <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 mt-1"></div>
                        </div>
                        <p className="text-gray-400 text-sm mb-2">{notification.message}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-gray-500 text-xs">
                            {new Date(notification.created_date).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="p-1 hover:bg-red-500/10 rounded transition-all"
                          >
                            <Trash2 className="w-3 h-3 text-red-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
