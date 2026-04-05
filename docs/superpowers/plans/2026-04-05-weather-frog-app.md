# Weather Frog App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a weather web app that displays Google Weather Frog artwork matching current weather conditions, with a full forecast display.

**Architecture:** Next.js 16 App Router with two pages (home, about). Client-side WeatherProvider context manages location + weather state. Two API route handlers (`/api/weather`, `/api/geocode`) proxy OpenWeatherMap calls to keep the API key server-side. A build-time script copies frog images to `public/frog/` and generates a TypeScript scene catalog. The FrogScene component composites 3 PNG layers (bg/mg/fg) via absolute positioning.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, OpenWeatherMap API

**Spec:** `docs/superpowers/specs/2026-04-05-weather-frog-app-design.md`

**⚠️ Next.js 16 note:** Before writing any code, check the relevant guide in `node_modules/next/dist/docs/` per AGENTS.md. Route handlers use standard Web Request/Response APIs. The Image component uses `next/image` with `fill` prop for responsive images.

---

## File Structure

```
lib/
  types.ts              — shared TypeScript types (weather, frog scenes, location)
  weather-codes.ts      — OWM condition ID → frog image code mapping
  frog-scenes.ts        — GENERATED: static catalog of available scenes per frog code

scripts/
  prepare-images.mjs    — copies optimized images to public/frog/, generates frog-scenes.ts

app/
  globals.css           — MODIFY: weather theme (gradient bg, card styles, breakpoints)
  layout.tsx            — MODIFY: metadata, add Header/Footer, WeatherProvider
  page.tsx              — MODIFY: home page with frog hero + forecast
  about/
    page.tsx            — About page with frog gallery and credits
  api/
    weather/
      route.ts          — GET handler: proxies OWM current + forecast APIs
    geocode/
      route.ts          — GET handler: proxies OWM geocoding API

components/
  header.tsx            — logo, search bar, nav
  footer.tsx            — attribution, credits
  weather-provider.tsx  — React context: location, weather data, loading/error
  frog-scene.tsx        — 3-layer image compositing component
  location-search.tsx   — search input with geocoding + geolocation button
  current-weather.tsx   — temperature, condition, detail metrics panel
  hourly-forecast.tsx   — scrollable horizontal forecast strip
  daily-forecast.tsx    — 5-day forecast list with temperature range bars
```

---

### Task 1: Image Pipeline Script

**Files:**
- Create: `scripts/prepare-images.mjs`
- Create: `lib/frog-scenes.ts` (generated output)
- Modify: `package.json` (add script)

The script scans `frog-images-optimized/square/` (the already-optimized images from the existing `optimize-images.mjs` script), copies them to `public/frog/`, and generates a TypeScript module cataloging all available scenes grouped by frog code.

- [ ] **Step 1: Write the prepare-images script**

Create `scripts/prepare-images.mjs`:

```js
import { readdir, mkdir, copyFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const SRC_DIR = "frog-images-optimized/square";
const OUT_DIR = "public/frog";
const CATALOG_PATH = "lib/frog-scenes.ts";

// Known locations in the frog image filenames.
// Used to split the variable-length condition from location-activity.
const KNOWN_LOCATIONS = [
  "beach", "busstop", "cafe", "citypark", "creek",
  "field", "hills", "home", "orchard", "rooftop",
];

function parseFilename(filename) {
  // Pattern: {code}-{condition...}-{location}-{activity}_{layer}.png
  // e.g. "03-partly-cloudy-day-beach-shells_bg.png"
  const base = filename.replace(/\.png$/, "");
  const layerMatch = base.match(/_(bg|mg|fg)$/);
  if (!layerMatch) return null;

  const layer = layerMatch[1];
  const prefix = base.slice(0, -layer.length - 1); // remove _bg/_mg/_fg

  // Extract code (first segment before first hyphen, always 2 digits)
  const firstHyphen = prefix.indexOf("-");
  if (firstHyphen === -1) return null;
  const code = prefix.slice(0, firstHyphen);

  // Find the location by searching for known locations in the remaining string
  const rest = prefix.slice(firstHyphen + 1); // everything after "01-"
  const parts = rest.split("-");

  let locationIdx = -1;
  for (let i = 0; i < parts.length; i++) {
    if (KNOWN_LOCATIONS.includes(parts[i])) {
      locationIdx = i;
      break;
    }
  }
  if (locationIdx === -1) return null;

  const condition = parts.slice(0, locationIdx).join("-");
  const location = parts[locationIdx];
  const activity = parts.slice(locationIdx + 1).join("-");

  return { code, condition, location, activity, layer, prefix };
}

async function main() {
  // Ensure output directory exists
  await mkdir(OUT_DIR, { recursive: true });

  const files = (await readdir(SRC_DIR)).filter((f) => f.endsWith(".png"));
  console.log(`Found ${files.length} images in ${SRC_DIR}`);

  // Copy all files
  let copied = 0;
  for (const file of files) {
    await copyFile(join(SRC_DIR, file), join(OUT_DIR, file));
    copied++;
  }
  console.log(`Copied ${copied} files to ${OUT_DIR}`);

  // Build scene catalog (only from _bg files to avoid triple-counting)
  const scenes = new Map(); // code -> Set of "condition|location|activity"
  for (const file of files) {
    const parsed = parseFilename(file);
    if (!parsed || parsed.layer !== "bg") continue;

    const key = parsed.code;
    if (!scenes.has(key)) scenes.set(key, new Set());
    scenes.get(key).add(`${parsed.condition}|${parsed.location}|${parsed.activity}`);
  }

  // Generate TypeScript catalog
  const lines = [
    "// AUTO-GENERATED by scripts/prepare-images.mjs — do not edit",
    "",
    "export interface FrogScene {",
    "  condition: string;",
    "  location: string;",
    "  activity: string;",
    "}",
    "",
    "export const FROG_SCENES: Record<string, FrogScene[]> = {",
  ];

  const sortedCodes = [...scenes.keys()].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  for (const code of sortedCodes) {
    const sceneList = [...scenes.get(code)].sort();
    lines.push(`  "${code}": [`);
    for (const scene of sceneList) {
      const [condition, location, activity] = scene.split("|");
      lines.push(`    { condition: "${condition}", location: "${location}", activity: "${activity}" },`);
    }
    lines.push("  ],");
  }

  lines.push("};");
  lines.push("");

  await writeFile(CATALOG_PATH, lines.join("\n"));
  console.log(`Generated ${CATALOG_PATH} with ${sortedCodes.length} codes`);
}

main();
```

- [ ] **Step 2: Add the script to package.json**

Add to the `"scripts"` section in `package.json`:

```json
"prepare-images": "node scripts/prepare-images.mjs"
```

- [ ] **Step 3: Run the script and verify output**

Run: `pnpm prepare-images`

Expected: Images copied to `public/frog/`, `lib/frog-scenes.ts` generated with entries for codes 01-26.

Verify: `ls public/frog/ | head -10` should show frog PNGs. `head -20 lib/frog-scenes.ts` should show the generated TypeScript catalog.

- [ ] **Step 4: Commit**

```bash
git add scripts/prepare-images.mjs lib/frog-scenes.ts package.json
git commit -m "feat: add image pipeline script to copy frog images and generate scene catalog"
```

Note: Do NOT commit `public/frog/` — add `public/frog/` to `.gitignore` since these are derived from `frog-images-optimized/`. The script regenerates them.

---

### Task 2: TypeScript Types & Weather Code Mapping

**Files:**
- Create: `lib/types.ts`
- Create: `lib/weather-codes.ts`

- [ ] **Step 1: Create shared types**

Create `lib/types.ts`:

```ts
export interface Location {
  name: string;
  lat: number;
  lon: number;
  country?: string;
  state?: string;
}

export interface CurrentWeatherData {
  temp: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  windSpeed: number;
  visibility: number;
  conditionId: number;
  condition: string;
  description: string;
  icon: string;
  sunrise: number;
  sunset: number;
  uvIndex?: number;
}

export interface HourlyDataPoint {
  dt: number;
  temp: number;
  conditionId: number;
  condition: string;
  icon: string;
  pop: number; // probability of precipitation (0-1)
}

export interface DailyDataPoint {
  dt: number;
  tempMin: number;
  tempMax: number;
  conditionId: number;
  condition: string;
  icon: string;
  pop: number;
}

export interface WeatherResponse {
  current: CurrentWeatherData;
  hourly: HourlyDataPoint[];
  daily: DailyDataPoint[];
}
```

- [ ] **Step 2: Create weather code mapping**

Create `lib/weather-codes.ts`:

```ts
// Maps OpenWeatherMap condition IDs to frog image codes.
// OWM docs: https://openweathermap.org/weather-conditions
// Frog codes correspond to image filename prefixes (01-26).

interface FrogCodeMapping {
  day: string;
  night: string;
  label: string;
}

const WEATHER_CODE_MAP: Record<number, FrogCodeMapping> = {};

function mapRange(start: number, end: number, mapping: FrogCodeMapping) {
  for (let id = start; id <= end; id++) {
    WEATHER_CODE_MAP[id] = mapping;
  }
}

// Thunderstorm group (2xx)
mapRange(200, 202, { day: "22", night: "22", label: "Iso Thunderstorms" });
mapRange(210, 232, { day: "24", night: "24", label: "Strong Thunderstorms" });

// Drizzle group (3xx)
mapRange(300, 321, { day: "10", night: "10", label: "Drizzle" });

// Rain group (5xx)
mapRange(500, 501, { day: "11", night: "11", label: "Rain" });
mapRange(502, 531, { day: "12", night: "12", label: "Heavy Rain" });

// Snow group (6xx)
mapRange(600, 601, { day: "15", night: "15", label: "Snow Showers" });
WEATHER_CODE_MAP[602] = { day: "17", night: "17", label: "Heavy Snow Blizzard" };
mapRange(611, 616, { day: "19", night: "19", label: "Mixed" });
mapRange(620, 622, { day: "13", night: "13", label: "Flurries" });

// Atmosphere group (7xx)
mapRange(701, 762, { day: "26", night: "26", label: "Haze/Fog" });
mapRange(771, 781, { day: "25", night: "25", label: "Windy" });

// Clear & clouds (8xx) — day/night variants
WEATHER_CODE_MAP[800] = { day: "01", night: "05", label: "Clear" };
WEATHER_CODE_MAP[801] = { day: "02", night: "06", label: "Few Clouds" };
WEATHER_CODE_MAP[802] = { day: "03", night: "07", label: "Partly Cloudy" };
WEATHER_CODE_MAP[803] = { day: "04", night: "08", label: "Mostly Cloudy" };
WEATHER_CODE_MAP[804] = { day: "04", night: "08", label: "Overcast" };

// Cloudy (09) doesn't have day/night — used as fallback for 803-804
// when you want a neutral cloudy look, but we'll prefer 04/08

const FALLBACK_CODE = "01"; // sunny as ultimate fallback

export function getFrogCode(
  conditionId: number,
  isNight: boolean
): string {
  const mapping = WEATHER_CODE_MAP[conditionId];
  if (!mapping) return FALLBACK_CODE;
  return isNight ? mapping.night : mapping.day;
}

export function isNightTime(now: number, sunrise: number, sunset: number): boolean {
  return now < sunrise || now > sunset;
}
```

- [ ] **Step 3: Verify types compile**

Run: `pnpm exec tsc --noEmit lib/types.ts lib/weather-codes.ts`

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add lib/types.ts lib/weather-codes.ts
git commit -m "feat: add TypeScript types and OWM-to-frog weather code mapping"
```

---

### Task 3: API Route Handlers

**Files:**
- Create: `app/api/weather/route.ts`
- Create: `app/api/geocode/route.ts`

Reference `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md` for Next.js 16 route handler conventions.

- [ ] **Step 1: Create the weather API route**

Create `app/api/weather/route.ts`:

```ts
import type { NextRequest } from "next/server";
import type {
  WeatherResponse,
  CurrentWeatherData,
  HourlyDataPoint,
  DailyDataPoint,
} from "@/lib/types";

const OWM_BASE = "https://api.openweathermap.org/data/2.5";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return Response.json({ error: "lat and lon are required" }, { status: 400 });
  }

  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Weather API key not configured" },
      { status: 500 }
    );
  }

  const params = new URLSearchParams({
    lat,
    lon,
    appid: apiKey,
    units: "imperial",
  });

  // Fetch current weather and 5-day forecast in parallel
  const [currentRes, forecastRes] = await Promise.all([
    fetch(`${OWM_BASE}/weather?${params}`),
    fetch(`${OWM_BASE}/forecast?${params}`),
  ]);

  if (!currentRes.ok || !forecastRes.ok) {
    return Response.json(
      { error: "Failed to fetch weather data" },
      { status: 502 }
    );
  }

  const currentData = await currentRes.json();
  const forecastData = await forecastRes.json();

  // Shape current weather
  const current: CurrentWeatherData = {
    temp: Math.round(currentData.main.temp),
    feelsLike: Math.round(currentData.main.feels_like),
    tempMin: Math.round(currentData.main.temp_min),
    tempMax: Math.round(currentData.main.temp_max),
    humidity: currentData.main.humidity,
    windSpeed: Math.round(currentData.wind.speed),
    visibility: Math.round((currentData.visibility ?? 10000) / 1609.34), // meters to miles
    conditionId: currentData.weather[0].id,
    condition: currentData.weather[0].main,
    description: currentData.weather[0].description,
    icon: currentData.weather[0].icon,
    sunrise: currentData.sys.sunrise,
    sunset: currentData.sys.sunset,
  };

  // Shape hourly forecast (next 8 intervals from the 3-hour forecast)
  const hourly: HourlyDataPoint[] = forecastData.list.slice(0, 8).map(
    (item: Record<string, unknown>) => ({
      dt: (item as { dt: number }).dt,
      temp: Math.round((item as { main: { temp: number } }).main.temp),
      conditionId: (item as { weather: { id: number }[] }).weather[0].id,
      condition: (item as { weather: { main: string }[] }).weather[0].main,
      icon: (item as { weather: { icon: string }[] }).weather[0].icon,
      pop: (item as { pop?: number }).pop ?? 0,
    })
  );

  // Aggregate daily forecast (group by date, take min/max temps)
  const dailyMap = new Map<
    string,
    { dt: number; temps: number[]; conditions: { id: number; main: string; icon: string }[]; pops: number[] }
  >();

  for (const item of forecastData.list) {
    const date = new Date(item.dt * 1000).toISOString().split("T")[0];
    if (!dailyMap.has(date)) {
      dailyMap.set(date, { dt: item.dt, temps: [], conditions: [], pops: [] });
    }
    const day = dailyMap.get(date)!;
    day.temps.push(item.main.temp);
    day.conditions.push({
      id: item.weather[0].id,
      main: item.weather[0].main,
      icon: item.weather[0].icon,
    });
    day.pops.push(item.pop ?? 0);
  }

  // Skip today, take next 5 days
  const todayStr = new Date().toISOString().split("T")[0];
  const daily: DailyDataPoint[] = [...dailyMap.entries()]
    .filter(([date]) => date !== todayStr)
    .slice(0, 5)
    .map(([, data]) => {
      // Pick the most common condition for the day (midday-biased)
      const midCondition =
        data.conditions[Math.floor(data.conditions.length / 2)];
      return {
        dt: data.dt,
        tempMin: Math.round(Math.min(...data.temps)),
        tempMax: Math.round(Math.max(...data.temps)),
        conditionId: midCondition.id,
        condition: midCondition.main,
        icon: midCondition.icon,
        pop: Math.max(...data.pops),
      };
    });

  const response: WeatherResponse = { current, hourly, daily };
  return Response.json(response);
}
```

- [ ] **Step 2: Create the geocode API route**

Create `app/api/geocode/route.ts`:

```ts
import type { NextRequest } from "next/server";

const OWM_GEO = "https://api.openweathermap.org/geo/1.0/direct";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");

  if (!q) {
    return Response.json({ error: "q (query) is required" }, { status: 400 });
  }

  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  const params = new URLSearchParams({
    q,
    limit: "5",
    appid: apiKey,
  });

  const res = await fetch(`${OWM_GEO}?${params}`);
  if (!res.ok) {
    return Response.json({ error: "Geocoding failed" }, { status: 502 });
  }

  const data = await res.json();
  const results = data.map(
    (item: { name: string; lat: number; lon: number; country: string; state?: string }) => ({
      name: item.name,
      lat: item.lat,
      lon: item.lon,
      country: item.country,
      state: item.state,
    })
  );

  return Response.json(results);
}
```

- [ ] **Step 3: Create .env.local with placeholder**

Create `.env.local`:

```
OPENWEATHERMAP_API_KEY=your_api_key_here
```

Tell the user to replace `your_api_key_here` with their actual key from https://home.openweathermap.org/api_keys.

- [ ] **Step 4: Verify the dev server starts without errors**

Run: `pnpm dev`

Visit `http://localhost:3000/api/weather?lat=37.77&lon=-122.42` — should return `{ error: "Weather API key not configured" }` or actual weather data if key is set.

- [ ] **Step 5: Commit**

```bash
git add app/api/weather/route.ts app/api/geocode/route.ts
git commit -m "feat: add weather and geocode API route handlers"
```

---

### Task 4: WeatherProvider Context

**Files:**
- Create: `components/weather-provider.tsx`

This is a client component that manages location detection, weather fetching, and exposes state to children via React context.

- [ ] **Step 1: Create the WeatherProvider**

Create `components/weather-provider.tsx`:

```tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { Location, WeatherResponse } from "@/lib/types";
import { getFrogCode, isNightTime } from "@/lib/weather-codes";
import { FROG_SCENES, type FrogScene } from "@/lib/frog-scenes";

interface WeatherState {
  location: Location | null;
  weather: WeatherResponse | null;
  frogCode: string;
  frogScene: FrogScene | null;
  isNight: boolean;
  loading: boolean;
  error: string | null;
  locationDenied: boolean;
  setLocation: (location: Location) => void;
  retry: () => void;
}

const WeatherContext = createContext<WeatherState | null>(null);

export function useWeather() {
  const ctx = useContext(WeatherContext);
  if (!ctx) throw new Error("useWeather must be used within WeatherProvider");
  return ctx;
}

function pickRandomScene(frogCode: string): FrogScene | null {
  const scenes = FROG_SCENES[frogCode];
  if (!scenes || scenes.length === 0) {
    // Fallback to code "01" (sunny)
    const fallback = FROG_SCENES["01"];
    if (!fallback || fallback.length === 0) return null;
    return fallback[Math.floor(Math.random() * fallback.length)];
  }
  return scenes[Math.floor(Math.random() * scenes.length)];
}

export function WeatherProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<Location | null>(null);
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [frogCode, setFrogCode] = useState("01");
  const [frogScene, setFrogScene] = useState<FrogScene | null>(null);
  const [isNight, setIsNight] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);

  const fetchWeather = useCallback(async (loc: Location) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/weather?lat=${loc.lat}&lon=${loc.lon}`
      );
      if (!res.ok) throw new Error("Failed to fetch weather");
      const data: WeatherResponse = await res.json();
      setWeather(data);

      const now = Math.floor(Date.now() / 1000);
      const night = isNightTime(now, data.current.sunrise, data.current.sunset);
      setIsNight(night);

      const code = getFrogCode(data.current.conditionId, night);
      setFrogCode(code);
      setFrogScene(pickRandomScene(code));
    } catch {
      setError("Froggy couldn't fetch the weather. Try again?");
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-detect location on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationDenied(true);
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        // Reverse geocode to get city name
        const loc: Location = {
          name: "Your Location",
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        };
        setLocation(loc);
        fetchWeather(loc);
      },
      () => {
        setLocationDenied(true);
        setLoading(false);
      },
      { timeout: 8000 }
    );
  }, [fetchWeather]);

  const handleSetLocation = useCallback(
    (loc: Location) => {
      setLocation(loc);
      setLocationDenied(false);
      fetchWeather(loc);
    },
    [fetchWeather]
  );

  const retry = useCallback(() => {
    if (location) fetchWeather(location);
  }, [location, fetchWeather]);

  return (
    <WeatherContext.Provider
      value={{
        location,
        weather,
        frogCode,
        frogScene,
        isNight,
        loading,
        error,
        locationDenied,
        setLocation: handleSetLocation,
        retry,
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `pnpm exec tsc --noEmit`

Expected: No errors (once frog-scenes.ts is generated from Task 1).

- [ ] **Step 3: Commit**

```bash
git add components/weather-provider.tsx
git commit -m "feat: add WeatherProvider context for location and weather state"
```

---

### Task 5: FrogScene Component

**Files:**
- Create: `components/frog-scene.tsx`

Renders 3 stacked image layers to composite the frog art.

- [ ] **Step 1: Create the FrogScene component**

Create `components/frog-scene.tsx`:

```tsx
import Image from "next/image";
import type { FrogScene as FrogSceneType } from "@/lib/frog-scenes";

interface FrogSceneProps {
  frogCode: string;
  scene: FrogSceneType;
  className?: string;
}

const LAYERS = ["bg", "mg", "fg"] as const;

export function FrogScene({ frogCode, scene, className = "" }: FrogSceneProps) {
  const prefix = `${frogCode}-${scene.condition}-${scene.location}-${scene.activity}`;

  return (
    <div
      className={`relative aspect-square overflow-hidden rounded-2xl shadow-lg ${className}`}
    >
      {LAYERS.map((layer, i) => (
        <Image
          key={layer}
          src={`/frog/${prefix}_${layer}.png`}
          alt={layer === "fg" ? `Weather Frog - ${scene.condition}` : ""}
          fill
          sizes="(min-width: 1200px) 380px, (min-width: 768px) 300px, 100vw"
          style={{ zIndex: i, objectFit: "cover" }}
          priority={layer === "bg"}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/frog-scene.tsx
git commit -m "feat: add FrogScene component for 3-layer image compositing"
```

---

### Task 6: LocationSearch Component

**Files:**
- Create: `components/location-search.tsx`

- [ ] **Step 1: Create the LocationSearch component**

Create `components/location-search.tsx`:

```tsx
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

  async function handleSearch(value: string) {
    setQuery(value);
    if (value.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

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
```

- [ ] **Step 2: Commit**

```bash
git add components/location-search.tsx
git commit -m "feat: add LocationSearch component with geocoding"
```

---

### Task 7: CurrentWeather Component

**Files:**
- Create: `components/current-weather.tsx`

- [ ] **Step 1: Create the CurrentWeather component**

Create `components/current-weather.tsx`:

```tsx
import type { CurrentWeatherData } from "@/lib/types";

interface CurrentWeatherProps {
  data: CurrentWeatherData;
  locationName: string;
}

function formatTime(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function CurrentWeather({ data, locationName }: CurrentWeatherProps) {
  return (
    <div className="flex flex-col justify-center gap-4 rounded-2xl bg-white/70 backdrop-blur-sm p-6 shadow-sm">
      <div>
        <div className="text-6xl font-light text-gray-800">{data.temp}°F</div>
        <div className="text-xl font-medium text-gray-600 mt-1 capitalize">
          {data.description}
        </div>
        <div className="text-sm text-gray-500 mt-1">
          📍 {locationName}
        </div>
        <div className="text-sm text-gray-400 mt-1">
          Feels like {data.feelsLike}° · H:{data.tempMax}° L:{data.tempMin}°
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-sm text-gray-600">
        <div className="flex items-center gap-1.5">
          <span>💧</span>
          <span>Humidity {data.humidity}%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>💨</span>
          <span>Wind {data.windSpeed} mph</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>👁</span>
          <span>Vis {data.visibility} mi</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>🌅</span>
          <span>{formatTime(data.sunrise)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>🌇</span>
          <span>{formatTime(data.sunset)}</span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/current-weather.tsx
git commit -m "feat: add CurrentWeather component with conditions display"
```

---

### Task 8: HourlyForecast Component

**Files:**
- Create: `components/hourly-forecast.tsx`

- [ ] **Step 1: Create the HourlyForecast component**

Create `components/hourly-forecast.tsx`:

```tsx
import type { HourlyDataPoint } from "@/lib/types";

interface HourlyForecastProps {
  data: HourlyDataPoint[];
}

// Simple OWM icon code → emoji mapping
function weatherEmoji(icon: string): string {
  const map: Record<string, string> = {
    "01d": "☀️", "01n": "🌙",
    "02d": "🌤", "02n": "☁️",
    "03d": "⛅", "03n": "⛅",
    "04d": "☁️", "04n": "☁️",
    "09d": "🌧", "09n": "🌧",
    "10d": "🌦", "10n": "🌧",
    "11d": "⛈", "11n": "⛈",
    "13d": "��", "13n": "🌨",
    "50d": "🌫", "50n": "🌫",
  };
  return map[icon] ?? "🌡";
}

function formatHour(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleTimeString([], {
    hour: "numeric",
  });
}

export function HourlyForecast({ data }: HourlyForecastProps) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">
        Hourly Forecast
      </h3>
      <div className="flex gap-1.5 overflow-x-auto pb-2">
        {data.map((item, i) => (
          <div
            key={item.dt}
            className={`
              min-w-[72px] flex-shrink-0 rounded-2xl p-3 text-center
              ${i === 0 ? "bg-white/75 shadow-sm" : "bg-white/50"}
            `}
          >
            <div className="text-xs text-gray-500">
              {i === 0 ? "Now" : formatHour(item.dt)}
            </div>
            <div className="text-xl my-1">{weatherEmoji(item.icon)}</div>
            <div className="text-sm font-semibold text-gray-700">
              {item.temp}°
            </div>
            {item.pop > 0.05 && (
              <div className="text-[10px] text-blue-400 mt-0.5">
                {Math.round(item.pop * 100)}%
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/hourly-forecast.tsx
git commit -m "feat: add HourlyForecast component with scrollable strip"
```

---

### Task 9: DailyForecast Component

**Files:**
- Create: `components/daily-forecast.tsx`

- [ ] **Step 1: Create the DailyForecast component**

Create `components/daily-forecast.tsx`:

```tsx
import type { DailyDataPoint } from "@/lib/types";

interface DailyForecastProps {
  data: DailyDataPoint[];
}

function weatherEmoji(icon: string): string {
  const map: Record<string, string> = {
    "01d": "☀️", "01n": "🌙",
    "02d": "🌤", "02n": "☁️",
    "03d": "⛅", "03n": "⛅",
    "04d": "☁️", "04n": "☁️",
    "09d": "🌧", "09n": "🌧",
    "10d": "🌦", "10n": "🌧",
    "11d": "⛈", "11n": "⛈",
    "13d": "🌨", "13n": "🌨",
    "50d": "🌫", "50n": "🌫",
  };
  return map[icon] ?? "🌡";
}

function formatDay(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString([], {
    weekday: "long",
  });
}

export function DailyForecast({ data }: DailyForecastProps) {
  // Find overall min/max for temperature bar scaling
  const allMin = Math.min(...data.map((d) => d.tempMin));
  const allMax = Math.max(...data.map((d) => d.tempMax));
  const range = allMax - allMin || 1;

  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">
        5-Day Forecast
      </h3>
      <div className="rounded-2xl bg-white/70 backdrop-blur-sm overflow-hidden shadow-sm">
        {data.map((day, i) => {
          const leftPct = ((day.tempMin - allMin) / range) * 100;
          const widthPct = ((day.tempMax - day.tempMin) / range) * 100;

          return (
            <div
              key={day.dt}
              className={`
                flex items-center gap-3 px-5 py-3.5
                ${i < data.length - 1 ? "border-b border-gray-100/50" : ""}
              `}
            >
              <span className="w-20 text-sm font-medium text-gray-700">
                {formatDay(day.dt)}
              </span>
              <span className="text-xl w-8">{weatherEmoji(day.icon)}</span>
              <span className="flex-1 text-sm text-gray-500 capitalize">
                {day.condition}
              </span>
              <span className="w-9 text-sm text-gray-400 text-right">
                {day.tempMin}°
              </span>
              <div className="w-28 h-1.5 bg-gray-200/50 rounded-full relative mx-2">
                <div
                  className="absolute h-full rounded-full bg-gradient-to-r from-blue-300 to-orange-300"
                  style={{
                    left: `${leftPct}%`,
                    width: `${Math.max(widthPct, 8)}%`,
                  }}
                />
              </div>
              <span className="w-9 text-sm font-semibold text-gray-700">
                {day.tempMax}°
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/daily-forecast.tsx
git commit -m "feat: add DailyForecast component with temperature range bars"
```

---

### Task 10: Header & Footer

**Files:**
- Create: `components/header.tsx`
- Create: `components/footer.tsx`

- [ ] **Step 1: Create the Header component**

Create `components/header.tsx`:

```tsx
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
```

- [ ] **Step 2: Create the Footer component**

Create `components/footer.tsx`:

```tsx
export function Footer() {
  return (
    <footer className="bg-white/50 backdrop-blur-sm border-t border-white/30 mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
        <span>Weather Frog</span>
        <span>
          Data from{" "}
          <a
            href="https://openweathermap.org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-700"
          >
            OpenWeatherMap
          </a>{" "}
          · Frog art by Google
        </span>
        <span>Built with Next.js</span>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/header.tsx components/footer.tsx
git commit -m "feat: add Header and Footer components"
```

---

### Task 11: Update Global Styles & Layout

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Update globals.css with weather theme**

Replace the full contents of `app/globals.css`:

```css
@import "tailwindcss";

:root {
  --background: #e8f5e9;
  --foreground: #1b5e20;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

body {
  background: linear-gradient(180deg, #87ceeb 0%, #c8e6c9 40%, #e8f5e9 100%);
  background-attachment: fixed;
  color: var(--foreground);
  font-family: var(--font-sans), Arial, Helvetica, sans-serif;
  min-height: 100vh;
}
```

- [ ] **Step 2: Update layout.tsx with metadata and providers**

Replace the full contents of `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { WeatherProvider } from "@/components/weather-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Weather Frog",
  description:
    "A playful weather app featuring Google's beloved Weather Frog artwork.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <WeatherProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </WeatherProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Verify the dev server renders**

Run: `pnpm dev`

Visit `http://localhost:3000` — should show the header, footer, and gradient background (page content still boilerplate, that's next).

- [ ] **Step 4: Commit**

```bash
git add app/globals.css app/layout.tsx
git commit -m "feat: update layout with WeatherProvider, Header, Footer, and weather theme"
```

---

### Task 12: Home Page

**Files:**
- Modify: `app/page.tsx`

Assembles FrogScene, CurrentWeather, HourlyForecast, and DailyForecast into the home page.

- [ ] **Step 1: Replace page.tsx with the weather home page**

Replace the full contents of `app/page.tsx`:

```tsx
"use client";

import { useWeather } from "@/components/weather-provider";
import { FrogScene } from "@/components/frog-scene";
import { CurrentWeather } from "@/components/current-weather";
import { HourlyForecast } from "@/components/hourly-forecast";
import { DailyForecast } from "@/components/daily-forecast";

function LoadingSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6 animate-pulse">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-[380px] aspect-square bg-white/40 rounded-2xl" />
        <div className="flex-1 bg-white/40 rounded-2xl min-h-[200px]" />
      </div>
      <div className="h-24 bg-white/40 rounded-2xl" />
      <div className="h-64 bg-white/40 rounded-2xl" />
    </div>
  );
}

function LocationPrompt() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-20 text-center">
      <div className="text-7xl mb-6">🐸</div>
      <h2 className="text-2xl font-semibold text-gray-700 mb-3">
        Where are you, friend?
      </h2>
      <p className="text-gray-500 max-w-md mx-auto">
        Share your location or search for a city in the search bar above to see
        your weather forecast with Froggy!
      </p>
    </div>
  );
}

function ErrorDisplay({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-20 text-center">
      <div className="text-7xl mb-6">🐸</div>
      <h2 className="text-xl font-semibold text-gray-700 mb-3">{message}</h2>
      <button
        onClick={onRetry}
        className="mt-4 px-6 py-2.5 bg-green-600 text-white rounded-full text-sm font-medium hover:bg-green-700 transition-colors shadow-sm"
      >
        Try Again
      </button>
    </div>
  );
}

export default function Home() {
  const {
    weather,
    location,
    frogCode,
    frogScene,
    loading,
    error,
    locationDenied,
    retry,
  } = useWeather();

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorDisplay message={error} onRetry={retry} />;
  if (locationDenied && !weather) return <LocationPrompt />;
  if (!weather || !location) return <LocationPrompt />;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      {/* Hero row: frog art + current conditions */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-[380px] shrink-0">
          {frogScene ? (
            <FrogScene frogCode={frogCode} scene={frogScene} />
          ) : (
            <div className="aspect-square bg-white/40 rounded-2xl flex items-center justify-center text-6xl">
              🐸
            </div>
          )}
        </div>
        <div className="flex-1">
          <CurrentWeather
            data={weather.current}
            locationName={
              location.state
                ? `${location.name}, ${location.state}`
                : location.name
            }
          />
        </div>
      </div>

      {/* Hourly forecast */}
      {weather.hourly.length > 0 && (
        <HourlyForecast data={weather.hourly} />
      )}

      {/* Daily forecast */}
      {weather.daily.length > 0 && (
        <DailyForecast data={weather.daily} />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify in browser**

Run: `pnpm dev`

Visit `http://localhost:3000` — should show:
1. If geolocation allowed + API key set: frog hero with weather data
2. If geolocation denied: "Where are you, friend?" prompt
3. If API key not set: error state with retry

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: build home page with frog hero, hourly and daily forecast"
```

---

### Task 13: About Page

**Files:**
- Create: `app/about/page.tsx`

- [ ] **Step 1: Create the About page**

Create `app/about/page.tsx`:

```tsx
import { FROG_SCENES } from "@/lib/frog-scenes";
import { FrogScene } from "@/components/frog-scene";

// Pick a sample scene from various weather codes for the gallery
const GALLERY_CODES = ["01", "05", "10", "11", "15", "17", "24", "25"];

function getGalleryScenes() {
  return GALLERY_CODES.map((code) => {
    const scenes = FROG_SCENES[code];
    if (!scenes || scenes.length === 0) return null;
    return { code, scene: scenes[0] };
  }).filter((s): s is { code: string; scene: (typeof FROG_SCENES)[string][number] } => s !== null);
}

export default function AboutPage() {
  const galleryScenes = getGalleryScenes();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
      {/* Intro */}
      <section className="text-center">
        <div className="text-7xl mb-4">🐸</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          About Weather Frog
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
          The Weather Frog (also known as &ldquo;Froggy&rdquo;) is Google&rsquo;s
          beloved weather mascot. Originally featured in Google&rsquo;s Pixel
          Weather app and Nest Hub displays, Froggy reacts to the weather in
          delightful ways — reading on the beach when it&rsquo;s sunny, huddling
          under an umbrella in the rain, or making s&rsquo;mores by a campfire
          on a cloudy night.
        </p>
        <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed mt-4">
          Though Google removed Froggy from their newer Pixel Weather designs in
          late 2024, the community has kept the spirit alive. This app brings
          Froggy back to life, pairing the artwork with real weather data so you
          can see what Froggy is up to in your local weather.
        </p>
      </section>

      {/* Gallery */}
      <section>
        <h2 className="text-xl font-semibold text-gray-700 mb-6 text-center">
          Froggy Through the Seasons
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {galleryScenes.map(({ code, scene }) => (
            <div key={code} className="space-y-2">
              <FrogScene frogCode={code} scene={scene} className="w-full" />
              <p className="text-xs text-gray-500 text-center capitalize">
                {scene.condition.replace(/-/g, " ")}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Credits */}
      <section className="text-center bg-white/60 rounded-2xl p-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Credits</h2>
        <div className="space-y-2 text-sm text-gray-500">
          <p>
            Frog artwork by{" "}
            <span className="font-medium text-gray-700">Google</span>
          </p>
          <p>
            Weather data from{" "}
            <a
              href="https://openweathermap.org"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-green-700 underline hover:text-green-800"
            >
              OpenWeatherMap
            </a>
          </p>
          <p>
            Built with{" "}
            <a
              href="https://nextjs.org"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-gray-700 underline hover:text-gray-900"
            >
              Next.js
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Verify in browser**

Visit `http://localhost:3000/about` — should show intro text, gallery grid with 8 frog scenes, and credits section.

- [ ] **Step 3: Commit**

```bash
git add app/about/page.tsx
git commit -m "feat: add About page with frog gallery and credits"
```

---

### Task 14: Final Cleanup & Verification

**Files:**
- Modify: `.gitignore` (add `public/frog/`)
- Remove: default `public/` SVGs that are no longer used

- [ ] **Step 1: Update .gitignore**

Add to `.gitignore`:

```
# Generated frog images (derived from frog-images-optimized/)
public/frog/
```

- [ ] **Step 2: Remove unused default assets**

Delete from `public/`: `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`

- [ ] **Step 3: Run lint**

Run: `pnpm lint`

Fix any lint errors that come up.

- [ ] **Step 4: Run build**

Run: `pnpm build`

Expected: Successful build with no errors.

- [ ] **Step 5: Full end-to-end verification**

1. Run `pnpm prepare-images` — verify images copied and catalog generated
2. Set a valid OWM API key in `.env.local`
3. Run `pnpm dev`
4. Visit `http://localhost:3000`:
   - Allow geolocation → should see frog art + weather for your location
   - Search for a different city → data updates, new frog scene loads
5. Visit `http://localhost:3000/about` → gallery and credits render
6. Resize browser to test responsive breakpoints (mobile stacks, desktop is side-by-side)

- [ ] **Step 6: Final commit**

```bash
git add .gitignore
git commit -m "chore: add public/frog to gitignore, remove default assets"
```
