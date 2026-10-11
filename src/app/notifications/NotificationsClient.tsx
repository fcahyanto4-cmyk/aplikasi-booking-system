"use client";

import { useState } from "react";
import { Bell, Check, CheckCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils/format";
import { markNotificationAsRead, markAllNotificationsAsRead } from "@/app/actions/notifications";
import type { Notification } from "@/types/database";

interface NotificationsClientProps {
  initialNotifications: Notification[];
}

export default function NotificationsClient({ initialNotifications }: NotificationsClientProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAsRead = async (id: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setLoadingId(id);

    try {
      await markNotificationAsRead(id);
    } catch (err) {
      console.error("Failed to mark as read:", err);
    } finally {
      setLoadingId(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setIsMarkingAll(true);

    try {
      await markAllNotificationsAsRead();
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    } finally {
      setIsMarkingAll(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text">Notifikasi</h1>
            <p className="text-text-muted mt-1">
              {unreadCount > 0 ? `${unreadCount} notifikasi belum dibaca` : "Semua notifikasi sudah dibaca"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAll}
              className="border-border text-text hover:bg-surface-hover"
            >
              {isMarkingAll ? (
                <Loader2 size={16} className="mr-2 animate-spin" />
              ) : (
                <CheckCheck size={16} className="mr-2 text-primary" />
              )}
              Tandai semua dibaca
            </Button>
          )}
        </div>

        {notifications && notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-surface rounded-xl p-5 border transition-all ${
                  notification.is_read
                    ? "border-border opacity-75"
                    : "border-primary/30 bg-primary/5 shadow-sm"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`p-2 rounded-full shrink-0 ${
                      notification.is_read ? "bg-surface-hover" : "bg-primary/10"
                    }`}
                  >
                    <Bell
                      size={18}
                      className={notification.is_read ? "text-text-muted" : "text-primary"}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1 gap-2">
                      <h3 className="font-semibold text-text truncate">{notification.title}</h3>
                      <span className="text-xs text-text-muted shrink-0">
                        {formatDate(notification.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-text-muted leading-relaxed">{notification.message}</p>
                  </div>
                  {!notification.is_read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleMarkAsRead(notification.id)}
                      disabled={loadingId === notification.id}
                      className="shrink-0 text-text-muted hover:text-primary hover:bg-primary/10"
                      title="Tandai sudah dibaca"
                    >
                      {loadingId === notification.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Check size={16} />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-surface rounded-xl p-12 border border-border text-center">
            <Bell size={48} className="mx-auto text-text-muted mb-4 opacity-50" />
            <p className="text-text-muted text-lg">Tidak ada notifikasi.</p>
            <p className="text-text-muted text-sm mt-2">Notifikasi baru akan muncul di sini.</p>
          </div>
        )}
      </div>
    </div>
  );
}
