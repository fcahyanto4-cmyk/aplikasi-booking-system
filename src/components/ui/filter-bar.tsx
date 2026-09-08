"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Search, Filter, X } from "lucide-react";

interface FilterBarProps {
  onFilterChange: (filters: {
    dateFrom?: string;
    dateTo?: string;
    venueId?: string;
    status?: string;
    minPrice?: number;
    maxPrice?: number;
  }) => void;
  venues: { id: string; name: string }[];
}

export default function FilterBar({ onFilterChange, venues }: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState(searchParams.get("dateFrom") || "");
  const [dateTo, setDateTo] = useState(searchParams.get("dateTo") || "");
  const [venueId, setVenueId] = useState(searchParams.get("venueId") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");

  const handleApplyFilters = () => {
    onFilterChange({
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      venueId: venueId || undefined,
      status: status || undefined,
    });
  };

  const handleClearFilters = () => {
    setDateFrom("");
    setDateTo("");
    setVenueId("");
    setStatus("");
    onFilterChange({});
  };

  return (
    <div className="bg-surface rounded-xl p-4 border border-border mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="search" className="text-text mb-2 block">Cari Jadwal</Label>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <Input
              id="search"
              placeholder="Cari berdasarkan nama venue..."
              className="pl-10 bg-background border-border text-text"
            />
          </div>
        </div>

        <div className="flex items-end">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="border-border text-text"
          >
            <Filter size={16} className="mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-text mb-2 block">Dari Tanggal</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="bg-background border-border text-text"
              />
            </div>
            <div>
              <Label className="text-text mb-2 block">Sampai Tanggal</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="bg-background border-border text-text"
              />
            </div>
            <div>
              <Label className="text-text mb-2 block">Venue</Label>
              <Select value={venueId} onValueChange={setVenueId}>
                <SelectTrigger className="bg-background border-border text-text">
                  <SelectValue placeholder="Semua Venue" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua Venue</SelectItem>
                  {venues.map((v) => (
                    <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-text mb-2 block">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="bg-background border-border text-text">
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua Status</SelectItem>
                  <SelectItem value="open">Tersedia</SelectItem>
                  <SelectItem value="full">Penuh</SelectItem>
                  <SelectItem value="completed">Selesai</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleApplyFilters} className="bg-primary hover:bg-primary-hover text-background">
              <Search size={16} className="mr-2" />Terapkan
            </Button>
            <Button variant="outline" onClick={handleClearFilters} className="border-border text-text">
              <X size={16} className="mr-2" />Reset
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
