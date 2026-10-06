"use client";

import { useState, useMemo } from "react";
import ScheduleFilterBar, { type ScheduleFilterState } from "./ScheduleFilterBar";
import SportsMatchCard from "./SportsMatchCard";
import SportsEventCard from "@/components/event/SportsEventCard";
import EventRecapSection from "./EventRecapSection";
import type { ScheduleWithVenue, Venue, EventWithVenue } from "@/types/database";
import { RotateCcw, Trophy, Calendar, Sparkles } from "lucide-react";
import { formatShortDate } from "@/lib/utils/format";

interface ScheduleCatalogClientProps {
  initialSchedules: ScheduleWithVenue[];
  venues: Venue[];
  events?: EventWithVenue[];
}

type TabType = "all" | "schedules" | "events";

export default function ScheduleCatalogClient({
  initialSchedules,
  venues,
  events = [],
}: ScheduleCatalogClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [filters, setFilters] = useState<ScheduleFilterState>({
    search: "",
    timeFilter: "all",
    availableOnly: false,
    venueId: "all",
  });

  // Calculate event date range recap
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events]);

  const eventDateRange = useMemo(() => {
    if (sortedEvents.length === 0) return null;
    const firstDate = sortedEvents[0].date;
    const lastDate = sortedEvents[sortedEvents.length - 1].date;
    if (firstDate === lastDate) {
      return `Tgl ${formatShortDate(firstDate)}`;
    }
    return `Tgl ${formatShortDate(firstDate)} s/d ${formatShortDate(lastDate)}`;
  }, [sortedEvents]);

  const filteredSchedules = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    return initialSchedules.filter((schedule) => {
      // 1. Search Query
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase();
        const venueName = schedule.venues?.name?.toLowerCase() || "";
        const venueAddress = schedule.venues?.address?.toLowerCase() || "";
        if (!venueName.includes(query) && !venueAddress.includes(query)) {
          return false;
        }
      }

      // 2. Venue ID
      if (filters.venueId !== "all" && schedule.venue_id !== filters.venueId) {
        return false;
      }

      // 3. Availability
      if (filters.availableOnly) {
        const isFull =
          schedule.current_players >= schedule.max_players ||
          schedule.status === "full";
        if (isFull) return false;
      }

      // 4. Time Filter
      if (filters.timeFilter === "today") {
        if (schedule.date !== todayStr) return false;
      } else if (filters.timeFilter === "tomorrow") {
        if (schedule.date !== tomorrowStr) return false;
      } else if (filters.timeFilter === "weekend") {
        const day = new Date(`${schedule.date}T00:00:00`).getDay();
        if (day !== 0 && day !== 6) return false;
      } else if (filters.timeFilter === "night") {
        const startHour = parseInt(schedule.start_time.substring(0, 2), 10);
        if (isNaN(startHour) || startHour < 19) return false;
      }

      return true;
    });
  }, [initialSchedules, filters]);

  const handleResetFilters = () => {
    setFilters({
      search: "",
      timeFilter: "all",
      availableOnly: false,
      venueId: "all",
    });
  };

  return (
    <div className="space-y-8">
      {/* Category Tab Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("all")}
            type="button"
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "all"
                ? "bg-primary text-background shadow-md shadow-primary/20"
                : "bg-surface text-text-muted hover:text-text border border-border"
            }`}
          >
            Semua Jadwal & Event ({filteredSchedules.length + sortedEvents.length})
          </button>

          <button
            onClick={() => setActiveTab("schedules")}
            type="button"
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "schedules"
                ? "bg-primary text-background shadow-md shadow-primary/20"
                : "bg-surface text-text-muted hover:text-text border border-border"
            }`}
          >
            <span>⚽ Mabar Reguler</span>
            <span className="text-[11px] opacity-80">({filteredSchedules.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("events")}
            type="button"
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "events"
                ? "bg-accent text-background shadow-md shadow-accent/20"
                : "bg-surface text-text-muted hover:text-text border border-border"
            }`}
          >
            <Trophy size={14} className="text-accent" />
            <span>Turnamen & Event</span>
            <span className="text-[11px] opacity-80">({sortedEvents.length})</span>
          </button>
        </div>

        {/* Quick Date Range recap pill */}
        {eventDateRange && (
          <div className="hidden md:inline-flex items-center gap-1.5 text-xs text-text-muted bg-surface px-3 py-1.5 rounded-full border border-border">
            <Sparkles size={13} className="text-accent" />
            <span>Rekapan Event Aktif:</span>
            <strong className="text-text font-bold text-accent">{eventDateRange}</strong>
          </div>
        )}
      </div>

      {/* Rekapan Event Section (Featured on "all" and "events" tab) */}
      {(activeTab === "all" || activeTab === "events") && sortedEvents.length > 0 && (
        <EventRecapSection
          events={sortedEvents}
          title="Rekapan Jadwal & Agenda Event"
          subtitle={`Rangkuman jadwal turnamen dan kompetisi ${eventDateRange ? `periode ${eventDateRange}` : ""}. Slot terbatas, amankan sekarang!`}
        />
      )}

      {/* Filter Bar for Regular Schedules (shown when not solely on events tab) */}
      {activeTab !== "events" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-text flex items-center gap-2">
              <Calendar size={18} className="text-primary" />
              <span>Sesi Mabar Reguler Komunitas</span>
            </h3>
            <span className="text-xs text-text-muted">
              {filteredSchedules.length} jadwal tersedia
            </span>
          </div>

          <ScheduleFilterBar
            venues={venues}
            filters={filters}
            onChange={setFilters}
            totalCount={filteredSchedules.length}
          />

          {filteredSchedules.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSchedules.map((schedule) => (
                <SportsMatchCard key={schedule.id} schedule={schedule} />
              ))}
            </div>
          ) : (
            <div className="bg-surface rounded-2xl p-8 border border-border text-center max-w-xl mx-auto my-6 space-y-4 shadow-sm">
              <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-2xl">
                ⚽
              </div>
              <h3 className="text-lg font-bold text-text">Jadwal Mabar Reguler Belum Tersedia</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Tidak ada jadwal mabar reguler yang cocok dengan filter kamu saat ini. Namun, kamu bisa mengikuti agenda event & turnamen di atas!
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleResetFilters}
                  type="button"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border text-text font-bold text-xs hover:bg-surface-hover transition-all"
                >
                  <RotateCcw size={14} />
                  <span>Reset Filter</span>
                </button>
                <button
                  onClick={() => setActiveTab("events")}
                  type="button"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-background font-bold text-xs hover:bg-accent/90 transition-all shadow-md shadow-accent/20"
                >
                  <Trophy size={14} />
                  <span>Lihat Event & Turnamen</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Grid of full Event Cards when on "events" tab */}
      {activeTab === "events" && sortedEvents.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border/70 pb-3">
            <h3 className="text-lg font-bold text-text flex items-center gap-2">
              <Trophy size={18} className="text-accent" />
              <span>Daftar Turnamen & Kompetisi</span>
            </h3>
            <span className="text-xs text-text-muted">
              {sortedEvents.length} event terdaftar
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedEvents.map((event) => (
              <SportsEventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
