"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  variant?: "icon" | "badge" | "compact";
  className?: string;
}

export default function ThemeToggle({ variant = "icon", className = "" }: ThemeToggleProps) {
  const [isOutdoor, setIsOutdoor] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("ymb_outdoor_mode");
    if (saved === "true") {
      setIsOutdoor(true);
      document.documentElement.classList.add("outdoor");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = !isOutdoor;
    setIsOutdoor(next);
    if (next) {
      document.documentElement.classList.add("outdoor");
      document.documentElement.classList.remove("dark");
      localStorage.setItem("ymb_outdoor_mode", "true");
    } else {
      document.documentElement.classList.remove("outdoor");
      document.documentElement.classList.add("dark");
      localStorage.setItem("ymb_outdoor_mode", "false");
    }
  };

  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-lg bg-surface/40 animate-pulse ${className}`} />
    );
  }

  if (variant === "badge") {
    return (
      <button
        onClick={toggleTheme}
        type="button"
        title={isOutdoor ? "Ganti ke Mode Stadium Dark" : "Ganti ke Mode Outdoor Terang"}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
          isOutdoor
            ? "bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200"
            : "bg-surface-hover text-text-muted border-border hover:text-text hover:border-primary/40"
        } ${className}`}
      >
        {isOutdoor ? (
          <>
            <Sun size={14} className="text-amber-600 animate-spin-slow" />
            <span>Outdoor Mode</span>
          </>
        ) : (
          <>
            <Moon size={14} className="text-primary" />
            <span>Stadium Dark</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={isOutdoor ? "Ganti ke Mode Stadium Dark" : "Ganti ke Mode Outdoor Terang (Anti-Silau)"}
      className={`relative inline-flex items-center justify-center w-9 h-9 rounded-lg border transition-all ${
        isOutdoor
          ? "bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200 shadow-sm"
          : "bg-surface/60 text-text-muted border-border hover:text-primary hover:border-primary/40 hover:bg-surface"
      } ${className}`}
      aria-label="Toggle outdoor daylight mode"
    >
      {isOutdoor ? (
        <Sun size={18} className="text-amber-600 transition-transform duration-300 hover:rotate-45" />
      ) : (
        <Moon size={18} className="text-primary transition-transform duration-300 hover:-rotate-12" />
      )}
    </button>
  );
}
