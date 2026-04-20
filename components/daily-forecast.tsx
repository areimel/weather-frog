import { Icon } from "@iconify/react";
import { getWeatherIcon } from "@/lib/weather-icons";
import type { DailyDataPoint } from "@/lib/types";

interface DailyForecastProps {
  data: DailyDataPoint[];
}

function formatDay(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const today = new Date();
  if (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  ) {
    return "Today";
  }
  return date.toLocaleDateString([], { weekday: "long" });
}

export function DailyForecast({ data }: DailyForecastProps) {
  // Find overall min/max for temperature bar scaling
  const allMin = Math.min(...data.map((d) => d.tempMin));
  const allMax = Math.max(...data.map((d) => d.tempMax));
  const range = allMax - allMin || 1;

  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">
        <Icon icon="lucide:calendar-days" className="w-3.5 h-3.5 inline mr-1.5" />
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
                flex items-center gap-3 px-5 py-4
                ${i < data.length - 1 ? "border-b border-gray-100/50" : ""}
              `}
            >
              <span className="w-20 text-sm font-medium text-gray-700">
                {formatDay(day.dt)}
              </span>
              <Icon
                icon={getWeatherIcon(day.icon)}
                className="w-7 h-7 text-gray-600 flex-shrink-0"
              />
              <div className="flex flex-col flex-1">
                <span className="text-sm text-gray-500 capitalize">
                  {day.condition}
                </span>
                {day.pop > 0.05 && (
                  <div className="flex items-center gap-1 text-xs text-blue-500">
                    <Icon icon="lucide:droplets" className="w-3 h-3" />
                    {Math.round(day.pop * 100)}%
                  </div>
                )}
                {day.pop <= 0.05 && <div className="h-4"></div>}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400 w-12">
                <Icon icon="lucide:droplets" className="w-3 h-3" />
                {day.humidity}%
              </div>
              <span className="w-9 text-sm text-gray-400 text-right">
                {day.tempMin}°
              </span>
              <div className="w-28 h-1.5 bg-gray-200/50 rounded-full relative mx-2">
                <div
                  className="absolute h-full rounded-full bg-gradient-to-r from-blue-400 to-amber-400"
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
