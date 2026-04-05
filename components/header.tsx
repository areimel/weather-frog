"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LocationSearch } from "./location-search";
import { useWeather } from "./weather-provider";

export function Header() {
  const pathname = usePathname();
  const { location, setLocation } = useWeather();

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-white/30 shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 px-6 py-3">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl">🐸</span>
          <span className="text-lg font-bold text-green-800">
            Weather Frog
          </span>
        </Link>

        <LocationSearch
          onSelect={setLocation}
          currentLocation={location}
        />

        <nav className="flex gap-5 text-sm shrink-0">
          <Link
            href="/"
            className={`transition-colors ${
              pathname === "/"
                ? "text-green-700 font-semibold"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Home
          </Link>
          <Link
            href="/about"
            className={`transition-colors ${
              pathname === "/about"
                ? "text-green-700 font-semibold"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}
