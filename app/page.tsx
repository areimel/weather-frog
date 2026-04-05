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
