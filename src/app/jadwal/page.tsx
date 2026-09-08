import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatDate, formatCurrency } from "@/lib/utils/format";
import { Calendar, Clock, MapPin, Users } from "lucide-react";

export const revalidate = 60;

export default async function JadwalPage() {
  const supabase = await createClient();

  const { data: schedules } = await supabase
    .from("schedules")
    .select("*, venues(*)")
    .gte("date", new Date().toISOString().split("T")[0])
    .order("date", { ascending: true })
    .order("start_time", { ascending: true })
    .limit(12);

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h1 className="text-3xl font-bold text-text">Jadwal Mabar</h1>
          <p className="text-text-muted mt-2 md:mt-0">Temukan jadwal bermain yang tersedia</p>
        </div>

        {schedules && schedules.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schedules.map((schedule: any) => {
              const venue = Array.isArray(schedule.venues) ? schedule.venues[0] : schedule.venues;
              const availableSlots = schedule.max_players - schedule.current_players;
              const isFull = availableSlots <= 0 || schedule.status === "full";

              return (
                <Link
                  key={schedule.id}
                  href={`/jadwal/${schedule.id}`}
                  className="bg-surface rounded-xl p-6 border border-border hover:border-primary/30 transition-all hover:shadow-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                      schedule.status === "open" && !isFull
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "bg-danger/20 text-danger border border-danger/30"
                    }`}>
                      {schedule.status === "open" && !isFull ? "Tersedia" : "Penuh"}
                    </span>
                    <span className="text-xs text-text-muted">
                      <Users size={12} className="inline mr-1" />
                      {schedule.current_players}/{schedule.max_players}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-text mb-2">Mabar di {venue?.name}</h2>

                  <div className="space-y-1 text-sm text-text-muted mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-primary" />
                      {formatDate(schedule.date)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-primary" />
                      {schedule.start_time.substring(0, 5)} - {schedule.end_time.substring(0, 5)}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-primary" />
                      {venue?.address}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="text-primary font-bold">{formatCurrency(schedule.price_per_person)}</span>
                    <span className="text-xs text-text-muted">{availableSlots} slot tersisa</span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="bg-surface rounded-xl p-12 border border-border text-center">
            <p className="text-text-muted text-lg">Belum ada jadwal tersedia.</p>
            <p className="text-text-muted text-sm mt-2">Coba lagi nanti atau cek halaman utama.</p>
          </div>
        )}
      </div>
    </div>
  );
}
