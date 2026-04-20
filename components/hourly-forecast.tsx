import { Icon } from "@iconify/react";
import { getWeatherIcon } from "@/lib/weather-icons";
import type { HourlyDataPoint } from "@/lib/types";

interface HourlyForecastProps {
  data: HourlyDataPoint[];
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
        <Icon icon="lucide:clock" className="w-3.5 h-3.5 inline mr-1.5" />
        Hourly Forecast
      </h3>
      <div className="grid grid-cols-4 md:grid-cols-8 gap-1.5 pb-2">
        {data.map((item, i) => (
          <div
            key={item.dt}
            className={`
              rounded-2xl p-3 text-center
              ${
                i === 0
                  ? "bg-white/75 shadow-sm ring-2 ring-green-400/40"
                  : "bg-white/50 hover:bg-white/70 transition-colors"
              }
            `}
          >
            <div className="text-xs text-gray-500">
              {i === 0 ? "Now" : formatHour(item.dt)}
            </div>
            <div className="text-xl my-1">
              <Icon
                icon={getWeatherIcon(item.icon)}
                className="w-10 h-10 text-gray-600 inline"
              />
            </div>
            <div className="text-sm font-semibold text-gray-700">
              {item.temp}°
            </div>
            {item.pop > 0.05 && (
              <div className="flex items-center gap-0.5 text-[10px] text-blue-500 mt-0.5 justify-center">
                <Icon icon="lucide:droplets" className="w-2.5 h-2.5" />
                {Math.round(item.pop * 100)}%
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
