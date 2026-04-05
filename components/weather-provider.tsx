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
