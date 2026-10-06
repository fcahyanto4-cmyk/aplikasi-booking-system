"use client";

import { useState, useEffect } from "react";
import { Search, X, Filter } from "lucide-react";
import type { Venue } from "@/types/database";

export interface ScheduleFilterState {
  search: string;
  timeFilter: "all" | "today" | "tomorrow" | "weekend" | "night";
  availableOnly: boolean;
  venueId: string;
}

interface ScheduleFilterBarProps {
  venues: Venue[];
  filters: ScheduleFilterState;
  onChange: (next: ScheduleFilterState) => void;
  totalCount: number;
}

const TIME_CHIPS: { id: ScheduleFilterState["timeFilter"]; label: string }[] = [
  { id: "all", label: "Semua Waktu" },
  { id: "today", label: "Hari Ini" },
  { id: "tomorrow", label: "Besok" },
  { id: "weekend", label: "Akhir Pekan" },
  { id: "night", label: "Malam (≥ 19.00)" },
];

export default function ScheduleFilterBar({
  venues,
  filters,
  onChange,
  totalCount,
}: ScheduleFilterBarProps) {
  const [searchInput, setSearchInput] = useState(filters.search);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        onChange({ ...filters, search: searchInput });
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchInput, filters, onChange]);

  const handleClearSearch = () => {
    setSearchInput("");
    onChange({ ...filters, search: "" });
  };

  const hasActiveFilters =
    filters.search !== "" ||
    filters.timeFilter !== "all" ||
    filters.availableOnly ||
    filters.venueId !== "all";

  const handleReset = () => {
    setSearchInput("");
    onChange({
      search: "",
      timeFilter: "all",
      availableOnly: false,
      venueId: "all",
    });
  };

  return (
    <div className="space-y-4 mb-8">
      {/* Top row: Search input + Venue Dropdown */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search input with icon and clear button */}
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cari venue, lapangan, atau alamat..."
            className="w-full bg-surface border border-border rounded-xl pl-10 pr-10 py-2.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
          />
          {searchInput && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text p-1 rounded-full hover:bg-surface-hover"
              title="Hapus pencarian"
              type="button"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Venue Select */}
        <div className="sm:w-64 relative">
          <select
            value={filters.venueId}
            onChange={(e) => onChange({ ...filters, venueId: e.target.value })}
            className="w-full bg-surface border border-border rounded-xl px-3.5 py-2.5 text-sm text-text appearance-none cursor-pointer focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm pr-8"
            aria-label="Pilih Lokasi Venue"
          >
            <option value="all">Semua Lokasi Venue ({venues.length})</option>
            {venues.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
            <Filter size={14} />
          </div>
        </div>
      </div>

      {/* Horizontal Scroll Filter Chips (Thumb-zone friendly) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 pt-0.5 -mx-4 px-4 sm:mx-0 sm:px-0">
        {/* Time Chips */}
        {TIME_CHIPS.map((chip) => {
          const isActive = filters.timeFilter === chip.id;
          return (
            <button
              key={chip.id}
              onClick={() => onChange({ ...filters, timeFilter: chip.id })}
              type="button"
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border ${
                isActive
                  ? "bg-primary text-background border-primary shadow-sm shadow-primary/30"
                  : "bg-surface text-text-muted border-border hover:border-primary/40 hover:text-text"
              }`}
            >
              {chip.label}
            </button>
          );
        })}

        {/* Divider */}
        <div className="h-4 w-px bg-border shrink-0 my-auto" />

        {/* Availability Toggle Chip */}
        <button
          onClick={() =>
            onChange({ ...filters, availableOnly: !filters.availableOnly })
          }
          type="button"
          className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border ${
            filters.availableOnly
              ? "bg-accent text-background border-accent shadow-sm shadow-accent/30"
              : "bg-surface text-text-muted border-border hover:border-accent/40 hover:text-text"
          }`}
        >
          {filters.availableOnly ? "✓ Sedia Slot Saja" : "Sedia Slot Saja"}
        </button>

        {/* Reset Filter Button if active */}
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

      {/* Result Counter */}
      <div className="flex items-center justify-between text-xs text-text-muted px-1">
        <span>Menampilkan <strong className="text-text font-semibold">{totalCount}</strong> jadwal</span>
        {hasActiveFilters && (
          <span className="text-primary text-[11px]">Filter aktif</span>
        )}
      </div>
    </div>
  );
}
