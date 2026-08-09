"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Upload, Bot, Calendar, Info, X } from 'lucide-react';

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: Date;
  icon?: string; // 'upload' | 'ai' | 'calendar' | 'info'
  read: boolean;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  addNotification: (title: string, description: string, icon?: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [toasts, setToasts] = useState<NotificationItem[]>([]);

  const addNotification = useCallback((title: string, description: string, icon?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newNotification: NotificationItem = {
      id,
      title,
      description,
      time: new Date(),
      icon,
      read: false,
    };

    setNotifications((prev) => [newNotification, ...prev]);
    
    // Add to toasts for visual display, keeping max 3
    setToasts((prev) => [newNotification, ...prev].slice(0, 3));

    // Auto mark as read after 5 seconds
    setTimeout(() => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    }, 5000);

    // Auto remove from toast after 1.5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 1500);
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, markAllAsRead, clearAll, unreadCount }}
    >
      {children}
      <NotificationToast toasts={toasts} setToasts={setToasts} />
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

function NotificationToast({ toasts, setToasts }: { toasts: NotificationItem[], setToasts: React.Dispatch<React.SetStateAction<NotificationItem[]>> }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none w-full max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-card border border-border text-foreground rounded-2xl shadow-xl p-4 flex gap-3 animate-in slide-in-from-right-8 fade-in duration-300"
        >
          <div className="flex-shrink-0 mt-0.5">
            {toast.icon === 'upload' && <Upload className="w-5 h-5 text-blue-500" />}
            {toast.icon === 'ai' && <Bot className="w-5 h-5 text-purple-500" />}
            {toast.icon === 'calendar' && <Calendar className="w-5 h-5 text-orange-500" />}
            {(!toast.icon || toast.icon === 'info') && <Info className="w-5 h-5 text-primary" />}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium leading-none mb-1.5">{toast.title}</h4>
            <p className="text-xs text-muted-foreground line-clamp-2">{toast.description}</p>
          </div>
          <button
            onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
