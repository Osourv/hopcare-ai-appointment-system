import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2, Calendar, FileText, Info } from 'lucide-react';
import { Notification, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
// You can use mockBackend or api depending on what's active. Let's use mockBackend or api conditionally if needed, 
// but since both use localStorage for notifications currently, it doesn't matter much. We'll import mockBackend.
import { api } from '../services/api'; // changed from mockBackend
import { Link } from 'react-router-dom';

export const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    
    // Fetch notifications
    const fetchNotifs = async () => {
      const notifs = await api.getNotifications(user.id);
      setNotifications(notifs);
    };
    
    fetchNotifs();
    
    // Poll every 10 seconds for demo purposes
    const interval = setInterval(fetchNotifs, 10000);
    return () => clearInterval(interval);
  }, [user]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (id: string, mongoId?: string) => {
    const targetId = mongoId || id;
    await api.markNotificationAsRead(targetId);
    setNotifications(notifications.map(n => n.id === id || (n as any)._id === targetId ? { ...n, read: true } : n));
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    await api.markAllNotificationsAsRead(user.id);
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type?: string) => {
    switch (type) {
      case 'appointment': return <Calendar size={16} className="text-blue-500" />;
      case 'system': return <Info size={16} className="text-amber-500" />;
      case 'message': return <FileText size={16} className="text-green-500" />;
      default: return <Bell size={16} className="text-slate-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-blue-600 transition-colors focus:outline-none"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <h3 className="font-semibold text-slate-800">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                <Check size={14} />
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">
                No notifications yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id || (notif as any)._id} 
                    className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 ${!notif.read ? 'bg-blue-50/30' : ''}`}
                    onClick={() => { if (!notif.read) handleMarkAsRead(notif.id, (notif as any)._id); }}
                  >
                    <div className="mt-1 flex-shrink-0">
                      <div className={`p-2 rounded-full ${!notif.read ? 'bg-blue-100' : 'bg-slate-100'}`}>
                        {getIcon(notif.type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notif.read ? 'font-semibold text-slate-800' : 'font-medium text-slate-600'}`}>
                        {notif.title}
                      </p>
                      <p className="text-sm text-slate-500 line-clamp-2 mt-0.5">
                        {notif.message}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-slate-400">
                          {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                        {notif.link && (
                          <Link to={notif.link} className="text-xs text-blue-600 font-medium hover:underline">
                            View details
                          </Link>
                        )}
                      </div>
                    </div>
                    {!notif.read && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
