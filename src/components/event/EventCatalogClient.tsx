"use client";

import { useState, useMemo, useEffect } from "react";
import SportsEventCard from "./SportsEventCard";
import type { EventWithVenue } from "@/types/database";
import { Search, X, RotateCcw, Trophy } from "lucide-react";

interface EventCatalogClientProps {
  initialEvents: EventWithVenue[];
}

type EventFilterType = "all" | "upcoming" | "tournament" | "league" | "available";

const FILTER_CHIPS: { id: EventFilterType; label: string }[] = [
  { id: "all", label: "Semua Event" },
  { id: "upcoming", label: "Akan Datang" },
  { id: "tournament", label: "Turnamen" },
  { id: "league", label: "Liga" },
  { id: "available", label: "Sedia Slot Saja" },
];

export default function EventCatalogClient({ initialEvents }: EventCatalogClientProps) {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<EventFilterType>("all");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const filteredEvents = useMemo(() => {
    return initialEvents.filter((event) => {
      // 1. Search filter
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase();
        const titleMatch = event.title?.toLowerCase().includes(q);
        const descMatch = event.description?.toLowerCase().includes(q);
        const venueMatch = event.venues?.name?.toLowerCase().includes(q);
        if (!titleMatch && !descMatch && !venueMatch) return false;
      }

      // 2. Type/Status filter
      if (activeFilter === "upcoming") {
        if (event.status !== "upcoming") return false;
      } else if (activeFilter === "tournament") {
        const title = event.title.toLowerCase();
        if (!title.includes("turnamen") && !title.includes("cup") && !title.includes("trofeo")) {
          return false;
        }
      } else if (activeFilter === "league") {
        const title = event.title.toLowerCase();
        if (!title.includes("liga") && !title.includes("season") && !title.includes("series")) {
          return false;
        }
      } else if (activeFilter === "available") {
        const isFull = event.current_participants >= event.max_participants;
        if (isFull || event.status === "completed" || event.status === "cancelled") {
          return false;
        }
      }

      return true;
    });
  }, [initialEvents, debouncedSearch, activeFilter]);

  const handleReset = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setActiveFilter("all");
  };

  const hasActiveFilters = debouncedSearch !== "" || activeFilter !== "all";

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="space-y-4">
        {/* Search bar */}
        <div className="relative max-w-md">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cari turnamen, liga, atau venue..."
            className="w-full bg-surface border border-border rounded-xl pl-10 pr-10 py-2.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
          />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput("");
                setDebouncedSearch("");
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text p-1 rounded-full hover:bg-surface-hover"
              title="Hapus pencarian"
              type="button"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          {FILTER_CHIPS.map((chip) => {
            const isActive = activeFilter === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => setActiveFilter(chip.id)}
                type="button"
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border ${
                  isActive
                    ? "bg-primary text-background border-primary shadow-sm shadow-primary/30"
                    : "bg-surface text-text-muted border-border hover:border-primary/40 hover:text-text"
                }`}
              >
                {chip.label}
              </button>
            );
          })}

          {hasActiveFilters && (
            <button
              onClick={handleReset}
              type="button"
              className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold text-danger hover:bg-danger/10 border border-danger/20 transition-colors ml-auto"
            >
              Reset Filter
            </button>
          )}
        </div>

        {/* Counter */}
        <div className="flex items-center justify-between text-xs text-text-muted px-1">
          <span>Menampilkan <strong className="text-text font-semibold">{filteredEvents.length}</strong> event</span>
          {hasActiveFilters && (
            <span className="text-primary text-[11px]">Filter aktif</span>
          )}
        </div>
      </div>

      {/* Grid of Events */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <SportsEventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="bg-surface rounded-2xl p-12 border border-border text-center max-w-md mx-auto my-8 space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto text-accent">
            <Trophy size={32} />
          </div>
          <h3 className="text-xl font-bold text-text">Event Tidak Ditemukan</h3>
          <p className="text-sm text-text-muted leading-relaxed">
            Tidak ada event atau turnamen yang cocok dengan filter kamu. Coba ubah kata kunci atau reset filter.
          </p>
          <button
            onClick={handleReset}
            type="button"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-background font-bold text-xs hover:bg-primary-hover transition-all shadow-md shadow-primary/20"
          >
            <RotateCcw size={14} />
            <span>Reset Semua Filter</span>
          </button>
        </div>
      )}
    </div>
  );
}
