import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Bell, Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils/format";
import Link from "next/link";

export const revalidate = 60;

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const unreadCount = notifications?.filter((n) => !n.is_read).length || 0;

  const handleMarkAsRead = async (id: string) => {
    "use server";
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  };

  const handleMarkAllAsRead = async () => {
    "use server";
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
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
            <Button variant="outline" onClick={handleMarkAllAsRead} className="border-border text-text">
              <CheckCheck size={16} className="mr-2" />
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
                  notification.is_read ? "border-border opacity-75" : "border-primary/30 bg-primary/5"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-full ${notification.is_read ? "bg-surface-hover" : "bg-primary/10"}`}>
                    <Bell size={18} className={notification.is_read ? "text-text-muted" : "text-primary"} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-text">{notification.title}</h3>
                      <span className="text-xs text-text-muted">{formatDate(notification.created_at)}</span>
                    </div>
                    <p className="text-sm text-text-muted">{notification.message}</p>
                  </div>
                  {!notification.is_read && (
                    <Button variant="ghost" size="icon" onClick={() => handleMarkAsRead(notification.id)}>
                      <Check size={16} />
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
