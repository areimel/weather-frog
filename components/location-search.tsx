"use client";

import { useState, useRef, useEffect } from "react";
import type { Location } from "@/lib/types";

interface LocationSearchProps {
  onSelect: (location: Location) => void;
  currentLocation: Location | null;
}

export function LocationSearch({ onSelect, currentLocation }: LocationSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Location[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSearch(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(value)}`);
        if (res.ok) {
          const data: Location[] = await res.json();
          setResults(data);
          setIsOpen(data.length > 0);
        }
      } finally {
        setSearching(false);
      }
    }, 350);
  }

  function handleSelect(loc: Location) {
    onSelect(loc);
    setQuery("");
    setResults([]);
    setIsOpen(false);
  }

  function formatLocation(loc: Location): string {
    const parts = [loc.name];
    if (loc.state) parts.push(loc.state);
    if (loc.country) parts.push(loc.country);
    return parts.join(", ");
  }

  return (
    <div ref={wrapperRef} className="relative flex-1 max-w-sm">
      <div className="flex items-center gap-2 rounded-full bg-white/70 backdrop-blur-sm px-4 py-2 shadow-sm border border-white/50">
        <span className="text-sm">🔍</span>
        <input
          type="text"
          placeholder={
            currentLocation
              ? formatLocation(currentLocation)
              : "Search for a city..."
          }
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-500 outline-none"
        />
        {searching && (
          <span className="text-xs text-gray-400 animate-pulse">...</span>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
          {results.map((loc, i) => (
            <button
              key={`${loc.lat}-${loc.lon}-${i}`}
              onClick={() => handleSelect(loc)}
              className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-green-50 transition-colors border-b border-gray-50 last:border-0"
            >
              <span className="font-medium">{loc.name}</span>
              {(loc.state || loc.country) && (
                <span className="text-gray-400 ml-1">
                  {[loc.state, loc.country].filter(Boolean).join(", ")}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
