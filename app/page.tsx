"use client";

import { useWeather } from "@/components/weather-provider";
import { FrogScene } from "@/components/frog-scene";
import { CurrentWeather } from "@/components/current-weather";
import { WeatherDetails } from "@/components/weather-details";
import { HourlyForecast } from "@/components/hourly-forecast";
import { DailyForecast } from "@/components/daily-forecast";
import { Icon } from "@iconify/react";

function LoadingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Hero skeleton */}
      <div className="max-w-2xl mx-auto animate-fade-up">
        <div className="aspect-square bg-white/40 rounded-2xl animate-pulse" />
      </div>
      {/* Details skeleton */}
      <div className="h-24 bg-white/40 rounded-2xl animate-pulse" />
      {/* Hourly skeleton */}
      <div className="h-24 bg-white/40 rounded-2xl animate-pulse" />
      {/* Daily skeleton */}
      <div className="h-64 bg-white/40 rounded-2xl animate-pulse" />
    </div>
  );
}

function LocationPrompt() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center animate-fade-up">
      <div className="flex justify-center mb-6">
        <Icon icon="meteocons:partly-cloudy-day-fill" width={80} height={80} />
      </div>
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
    <div className="max-w-4xl mx-auto px-4 py-20 text-center animate-fade-up">
      <div className="flex justify-center mb-6">
        <Icon icon="meteocons:thunderstorms-fill" width={80} height={80} />
      </div>
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
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Hero section */}
      <div className="max-w-2xl mx-auto animate-fade-up w-full">
        {frogScene ? (
          <FrogScene frogCode={frogCode} scene={frogScene}>
            <CurrentWeather
              data={weather.current}
              locationName={
                location.state
                  ? `${location.name}, ${location.state}`
                  : location.name
              }
            />
          </FrogScene>
        ) : (
          <div className="aspect-square bg-white/40 rounded-2xl flex items-center justify-center">
            <Icon icon="meteocons:partly-cloudy-day-fill" width={80} height={80} />
          </div>
        )}
      </div>

      {/* Weather details section */}
      <div className="max-w-4xl mx-auto w-full">
        <WeatherDetails data={weather.current} />
      </div>

      {/* Hourly forecast */}
      {weather.hourly.length > 0 && (
        <div className="max-w-4xl mx-auto w-full">
          <HourlyForecast data={weather.hourly} />
        </div>
      )}

      {/* Daily forecast */}
      {weather.daily.length > 0 && (
        <div className="max-w-4xl mx-auto w-full">
          <DailyForecast data={weather.daily} />
        </div>
      )}
    </div>
  );
}
