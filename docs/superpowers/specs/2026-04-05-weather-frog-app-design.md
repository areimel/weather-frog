# Weather Frog App — Design Spec

## Overview

A weather web app that displays Google Weather Frog artwork alongside real forecast data. The frog art dynamically matches current weather conditions, composited from 3 image layers (background, midground, foreground). Built with Next.js 16, React 19, TypeScript, and Tailwind CSS v4.

## Tech Decisions

- **Weather API:** OpenWeatherMap (free tier, requires API key)
- **Location input:** Browser geolocation with search box fallback
- **Image format:** Square 3-layer compositing (_bg/_mg/_fg stacked in the browser)
- **Forecast scope:** Current conditions + hourly + 5-day daily
- **Visual tone:** Playful & colorful
- **Layout:** Desktop/tablet-first, frog hero with side-by-side conditions panel

## Route Structure

| Route | Purpose |
|-------|---------|
| `/` | Home — weather display with frog art hero |
| `/about` | About the Weather Frog, gallery, credits |

Shared root layout provides header, footer, and gradient background.

## Page Layout

### Header
- Logo: frog icon + "Weather Frog" text (left)
- Search bar with geolocation button (center, ~360px)
- Nav links: Home, About (right)
- Semi-transparent with backdrop blur

### Home Page (`/`)

**Hero row** (flex, horizontal on desktop):
- Left: Frog art in a 1:1 square container (~380px), 3 layers stacked via absolute positioning, rounded corners, shadow
- Right: Current conditions panel — large temperature, condition text, feels-like/high/low, weather details grid (humidity, wind, visibility, sunrise/sunset, UV index)

**Hourly forecast** (full-width row):
- Horizontally scrollable strip of pill-shaped cards
- Each shows: time, weather icon, temperature, precipitation %
- "Now" card visually highlighted

**Daily forecast** (full-width list):
- 5 rows, each with: day name, weather icon, condition text, low temp, temperature range bar (gradient), high temp
- Contained in a semi-transparent card

### About Page (`/about`)
- Brief intro to the Weather Frog character and its history with Google Weather
- Gallery grid showing example frog scenes across weather conditions
- Credits: frog art by Google, weather data by OpenWeatherMap
- Link back to home

### Footer
- Three-column on desktop: branding (left), data attribution (center), tech credit (right)
- Stacks on narrow viewports

## Architecture

### Data Flow

1. Page loads → attempt `navigator.geolocation.getCurrentPosition()`
2. If denied/unavailable → prompt user to search
3. Location coords → `/api/weather?lat=X&lon=Y` (Next.js Route Handler)
4. Route Handler calls OpenWeatherMap API (keeps API key server-side) → returns weather JSON
5. Client receives weather data → maps OWM condition ID to frog image code → picks random scene → renders layers

### Components

| Component | Responsibility |
|-----------|---------------|
| `WeatherProvider` | React context: location state, weather data, loading/error states |
| `FrogScene` | Renders 3 stacked `<Image>` layers for a given frog code + scene |
| `CurrentWeather` | Temperature, condition, and detail metrics display |
| `HourlyForecast` | Scrollable horizontal strip of hourly cards |
| `DailyForecast` | 5-day forecast list with temperature range bars |
| `LocationSearch` | Search input with geocoding via OWM Geocoding API |
| `Header` | Logo, search bar, nav |
| `Footer` | Credits and attribution |

### API Route

**`/api/weather`** — GET handler
- Query params: `lat`, `lon`
- Calls two free OWM endpoints:
  - `/data/2.5/weather` — current conditions
  - `/data/2.5/forecast` — 5-day / 3-hour forecast (provides both hourly and daily data)
- Returns: `{ current, hourly, daily }` shaped for the frontend
- Hourly: extracted from the 3-hour forecast intervals
- Daily: aggregated from forecast data (group by date, take min/max temps)
- Keeps `OPENWEATHERMAP_API_KEY` server-side in `.env.local`

**`/api/geocode`** — GET handler
- Query params: `q` (city name)
- Calls OWM Geocoding API: `/geo/1.0/direct`
- Returns array of `{ name, lat, lon, country, state }` matches

### Weather Code Mapping

OpenWeatherMap condition IDs → frog image codes:

| OWM Group | OWM IDs | Frog Code (day/night) | Condition |
|-----------|---------|----------------------|-----------|
| Thunderstorm (light) | 200-202 | 22 | Iso Thunderstorms |
| Thunderstorm (heavy) | 210-232 | 24 | Strong Thunderstorms |
| Drizzle | 300-321 | 10 | Drizzle |
| Rain (light) | 500-501 | 11 | Rain |
| Rain (heavy) | 502-531 | 12 | Heavy Rain |
| Snow (light) | 600-601 | 15 | Snow Showers |
| Snow (heavy) | 602 | 17 | Heavy Snow Blizzard |
| Snow (sleet) | 611-616 | 19 | Mixed |
| Snow (shower) | 620-622 | 13 | Flurries |
| Atmosphere (fog/haze) | 701-762 | 26 | Haze/Fog/Dust/Smoke |
| Atmosphere (wind) | 771-781 | 25 | Breezy/Windy |
| Clear | 800 | 01 / 05 | Sunny / Clear Night |
| Few clouds | 801 | 02 / 06 | Mostly Sunny / Mostly Clear |
| Scattered clouds | 802 | 03 / 07 | Partly Cloudy |
| Broken/overcast | 803-804 | 04 / 08 | Mostly Cloudy |

Day/night is determined by comparing current time against OWM's `sys.sunrise` and `sys.sunset` timestamps.

### Scene Selection

Each frog code maps to multiple scenes (e.g., code 01 has: beach-reading, field-biking, hills-painting, etc.). On each weather fetch, a random scene is selected from the available options for that code.

## Image Pipeline

### Build-time Script: `scripts/prepare-images.mjs`
- Reads `frog-images-src/square/*.png`
- Copies all files to `public/frog/` (flat directory)
- Generates `lib/frog-scenes.ts`: a static TypeScript map of `{ [frogCode: string]: Scene[] }` where each `Scene` has `{ location: string, activity: string }`

### FrogScene Component
- Props: `frogCode`, `scene` (location + activity)
- Renders 3 absolutely-positioned `<Image>` elements:
  - `{code}-{condition}-{location}-{activity}_bg.png` (z-index: 0)
  - `{code}-{condition}-{location}-{activity}_mg.png` (z-index: 1)
  - `{code}-{condition}-{location}-{activity}_fg.png` (z-index: 2)
- Container has `position: relative`, `aspect-ratio: 1/1`, rounded corners, overflow hidden

## Visual Design

### Color & Theme
- Background: sky-to-ground gradient that could adapt to time of day / weather
- Cards: semi-transparent white with subtle blur (`rgba(255,255,255,0.7)`)
- Primary green: `#2E7D32` (matching frog theme)
- Typography: Geist Sans (already loaded), clean and readable
- Rounded corners throughout (12-20px on cards, 24px on search bar)
- Playful but not cartoonish — the frog art carries the personality

### Responsive Breakpoints
- Desktop (1200px+): Full side-by-side hero, max-width 1200px centered
- Tablet (768px-1199px): Slightly smaller frog art, still side-by-side
- Mobile (<768px): Hero stacks vertically, frog art full-width, conditions below

## Loading & Error States

| State | Behavior |
|-------|----------|
| Loading weather | Shimmer skeleton for frog art (1:1 square) + skeleton rows for forecast |
| Location denied | Friendly message: "Share your location or search for a city" |
| API error | "Froggy couldn't fetch the weather" with retry button |
| No images for code | Fall back to closest matching code, or generic sunny scene (code 01) |

## Environment Variables

```
OPENWEATHERMAP_API_KEY=<key>
```

Stored in `.env.local` (gitignored). The API route handler reads this server-side.
