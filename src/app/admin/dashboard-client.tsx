"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { formatDate, formatCurrency } from "@/lib/utils/format";
import { Calendar, Clock, MapPin, Users, CreditCard, Ticket, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DashboardStats {
  totalMembers: number;
  totalSchedules: number;
  totalEvents: number;
  totalRevenue: number;
  recentBookings: any[];
  recentEvents: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient();
      
      const [{ count: members }, { count: schedules }, { count: events }, { data: bookings }, { data: eventParticipants }] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("schedules").select("*", { count: "exact", head: true }),
        supabase.from("events").select("*", { count: "exact", head: true }),
        supabase.from("bookings").select("created_at, quantity, payment_status, profiles(full_name), schedules(venues(name))").order("created_at", { ascending: false }).limit(5),
        supabase.from("event_participants").select("created_at, payment_status, profiles(full_name), events(title)").order("created_at", { ascending: false }).limit(5),
      ]);

      let revenue = 0;
      if (bookings) {
        bookings.forEach((b: any) => {
          if (b.payment_status === "paid") {
            revenue += (b.quantity || 1) * (b.schedules?.price_per_person || 0);
          }
        });
      }

      setStats({
        totalMembers: members || 0,
        totalSchedules: schedules || 0,
        totalEvents: events || 0,
        totalRevenue: revenue,
        recentBookings: bookings || [],
        recentEvents: eventParticipants || [],
      });
      setLoading(false);
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-6 animate-pulse">
              <div className="h-4 w-24 bg-surface-hover rounded mb-2"></div>
              <div className="h-8 w-16 bg-surface-hover rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text">Dashboard Overview</h1>
        <p className="text-text-muted mt-2">Selamat datang di Panel Admin Yuk Main Bola.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-surface border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-muted">Total Member</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text">{stats?.totalMembers}</div>
          </CardContent>
        </Card>

        <Card className="bg-surface border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-muted">Total Pemasukan</CardTitle>
            <CreditCard className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text">{formatCurrency(stats?.totalRevenue || 0)}</div>
          </CardContent>
        </Card>

        <Card className="bg-surface border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-muted">Jadwal Mabar</CardTitle>
            <Calendar className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text">{stats?.totalSchedules}</div>
          </CardContent>
        </Card>

        <Card className="bg-surface border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-muted">Event & Turnamen</CardTitle>
            <Ticket className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text">{stats?.totalEvents}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-surface border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CreditCard size={18} /> Booking Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.recentBookings && stats.recentBookings.length > 0 ? (
              <div className="space-y-3">
                {stats.recentBookings.map((b: any) => (
                  <div key={b.id} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                    <div>
                      <p className="text-sm font-medium text-text">{b.profiles?.full_name || "Member"}</p>
                      <p className="text-xs text-text-muted">{b.schedules?.venues?.name || "Venue"}</p>
                    </div>
                    <Badge variant={b.payment_status === "paid" ? "default" : "secondary"}>
                      {b.payment_status === "paid" ? "Lunas" : "Pending"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted">Belum ada booking.</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-surface border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Ticket size={18} /> Event Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.recentEvents && stats.recentEvents.length > 0 ? (
              <div className="space-y-3">
                {stats.recentEvents.map((e: any) => (
                  <div key={e.id} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                    <div>
                      <p className="text-sm font-medium text-text">{e.profiles?.full_name || "Member"}</p>
                      <p className="text-xs text-text-muted">{e.events?.title || "Event"}</p>
                    </div>
                    <Badge variant={e.payment_status === "paid" ? "default" : "secondary"}>
                      {e.payment_status === "paid" ? "Lunas" : "Pending"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted">Belum ada event.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
