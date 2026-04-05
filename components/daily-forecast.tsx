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
