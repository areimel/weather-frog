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
    <div className="max-w-screen-2xl mx-auto w-full px-4 py-6 md:h-full md:flex md:flex-col">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:flex-1 md:min-h-0">
        {/* Hero skeleton */}
        <div className="animate-fade-up md:min-h-0 md:flex">
          <div className="aspect-square md:aspect-auto md:flex-1 bg-white/40 rounded-2xl animate-pulse" />
        </div>
        {/* Right column skeleton */}
        <div className="space-y-6 md:min-h-0 md:overflow-y-auto md:pr-2">
          <div className="h-24 bg-white/40 rounded-2xl animate-pulse" />
          <div className="h-24 bg-white/40 rounded-2xl animate-pulse" />
          <div className="h-64 bg-white/40 rounded-2xl animate-pulse" />
        </div>
      </div>
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
    <div className="max-w-screen-2xl mx-auto w-full px-4 py-6 md:h-full md:flex md:flex-col">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:flex-1 md:min-h-0">
        {/* Left column — Hero */}
        <div className="animate-fade-up md:min-h-0 md:flex">
          {frogScene ? (
            <FrogScene
              frogCode={frogCode}
              scene={frogScene}
              fillHeight
              className="md:w-full"
            >
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
            <div className="aspect-square md:aspect-auto md:flex-1 bg-white/40 rounded-2xl flex items-center justify-center">
              <Icon icon="meteocons:partly-cloudy-day-fill" width={80} height={80} />
            </div>
          )}
        </div>

        {/* Right column — Details & forecasts */}
        <div className="space-y-6 md:min-h-0 md:overflow-y-auto md:pr-2">
          <WeatherDetails data={weather.current} />

          {weather.hourly.length > 0 && (
            <HourlyForecast data={weather.hourly} />
          )}

          {weather.daily.length > 0 && (
            <DailyForecast data={weather.daily} />
          )}
        </div>
      </div>
    </div>
  );
}
