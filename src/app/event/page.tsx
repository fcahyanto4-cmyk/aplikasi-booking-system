import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatDate, formatCurrency } from "@/lib/utils/format";
import { Calendar, Clock, MapPin, Users, Trophy } from "lucide-react";

export const revalidate = 60;

export default async function EventPage() {
  const supabase = await createClient();

  const { data: events } = await supabase
    .from("events")
    .select("*, venues(*)")
    .in("status", ["upcoming", "ongoing"])
    .order("date", { ascending: true })
    .limit(12);

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h1 className="text-3xl font-bold text-text">Event & Turnamen</h1>
          <p className="text-text-muted mt-2 md:mt-0">Daftar event dan turnamen yang akan datang</p>
        </div>

        {events && events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event: any) => {
              const venue = Array.isArray(event.venues) ? event.venues[0] : event.venues;
              const availableSlots = event.max_participants - event.current_participants;
              const isFull = availableSlots <= 0;

              return (
                <Link
                  key={event.id}
                  href={`/event/${event.id}`}
                  className="bg-surface rounded-xl p-6 border border-border hover:border-primary/30 transition-all hover:shadow-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                      !isFull
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "bg-danger/20 text-danger border border-danger/30"
                    }`}>
                      {!isFull ? "Buka" : "Penuh"}
                    </span>
                    <span className="text-xs text-text-muted">
                      <Users size={12} className="inline mr-1" />
                      {event.current_participants}/{event.max_participants}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <Trophy size={16} className="text-primary" />
                    <h2 className="text-lg font-bold text-text">{event.title}</h2>
                  </div>

                  {event.description && (
                    <p className="text-sm text-text-muted mb-3 line-clamp-2">{event.description}</p>
                  )}

                  <div className="space-y-1 text-sm text-text-muted mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-primary" />
                      {formatDate(event.date)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-primary" />
                      {event.start_time.substring(0, 5)} - {event.end_time.substring(0, 5)}
                    </div>
                    {venue && (
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-primary" />
                        {venue.name}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="text-primary font-bold">{formatCurrency(event.price)}</span>
                    <span className="text-xs text-text-muted">{availableSlots} slot tersisa</span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="bg-surface rounded-xl p-12 border border-border text-center">
            <p className="text-text-muted text-lg">Belum ada event yang akan datang.</p>
            <p className="text-text-muted text-sm mt-2">Cek kembali nanti!</p>
          </div>
        )}
      </div>
    </div>
  );
}
