import Database from "better-sqlite3";
import type { WeatherResponse, Location } from "@/lib/types";

const WEATHER_TTL = 15 * 60; // 15 minutes in seconds
const GEOCODE_TTL = 24 * 60 * 60; // 24 hours in seconds

const DB_PATH = process.env.CACHE_DB_PATH || "./cache.db";

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.exec(`
      CREATE TABLE IF NOT EXISTS weather_cache (
        key TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS geocode_cache (
        key TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
    `);
  }
  return db;
}

function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

function weatherKey(lat: number, lon: number): string {
  return `weather:${lat.toFixed(2)}:${lon.toFixed(2)}`;
}

function geocodeKey(query: string): string {
  return `geocode:${query.toLowerCase().trim()}`;
}

export function getCachedWeather(
  lat: number,
  lon: number
): WeatherResponse | null {
  const row = getDb()
    .prepare("SELECT data, created_at FROM weather_cache WHERE key = ?")
    .get(weatherKey(lat, lon)) as
    | { data: string; created_at: number }
    | undefined;

  if (!row) return null;
  if (nowSeconds() - row.created_at > WEATHER_TTL) return null;

  return JSON.parse(row.data) as WeatherResponse;
}

export function setCachedWeather(
  lat: number,
  lon: number,
  data: WeatherResponse
): void {
  getDb()
    .prepare(
      "INSERT OR REPLACE INTO weather_cache (key, data, created_at) VALUES (?, ?, ?)"
    )
    .run(weatherKey(lat, lon), JSON.stringify(data), nowSeconds());
}

export function getCachedGeocode(query: string): Location[] | null {
  const row = getDb()
    .prepare("SELECT data, created_at FROM geocode_cache WHERE key = ?")
    .get(geocodeKey(query)) as
    | { data: string; created_at: number }
    | undefined;

  if (!row) return null;
  if (nowSeconds() - row.created_at > GEOCODE_TTL) return null;

  return JSON.parse(row.data) as Location[];
}

export function setCachedGeocode(query: string, data: Location[]): void {
  getDb()
    .prepare(
      "INSERT OR REPLACE INTO geocode_cache (key, data, created_at) VALUES (?, ?, ?)"
    )
    .run(geocodeKey(query), JSON.stringify(data), nowSeconds());
}

// Clean up expired entries — called occasionally to keep DB small
export function cleanExpiredEntries(): void {
  const now = nowSeconds();
  const d = getDb();
  d.prepare("DELETE FROM weather_cache WHERE ? - created_at > ?").run(
    now,
    WEATHER_TTL
  );
  d.prepare("DELETE FROM geocode_cache WHERE ? - created_at > ?").run(
    now,
    GEOCODE_TTL
  );
}
