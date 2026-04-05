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
    "13d": "🌨", "13n": "🌨",
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
