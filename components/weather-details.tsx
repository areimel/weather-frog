import type { CurrentWeatherData } from "@/lib/types";
import { Icon } from "@iconify/react";

interface WeatherDetailsProps {
  data: CurrentWeatherData;
}

function formatTime(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function WeatherDetails({ data }: WeatherDetailsProps) {
  const metrics = [
    { icon: "lucide:thermometer", label: "Feels Like", value: `${data.feelsLike}°` },
    { icon: "lucide:droplets", label: "Humidity", value: `${data.humidity}%` },
    { icon: "lucide:wind", label: "Wind", value: `${data.windSpeed} mph` },
    { icon: "lucide:eye", label: "Visibility", value: `${data.visibility} mi` },
    { icon: "lucide:sunrise", label: "Sunrise", value: formatTime(data.sunrise) },
    { icon: "lucide:sunset", label: "Sunset", value: formatTime(data.sunset) },
  ];

  return (
    <div className="rounded-2xl bg-white/60 backdrop-blur-sm shadow-sm overflow-hidden">
      <div className="grid grid-cols-2 md:grid-cols-3">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="flex items-center gap-3 px-5 py-4 border-b border-r border-gray-200/30"
          >
            <Icon icon={m.icon} className="w-5 h-5 text-green-600 shrink-0" />
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">
                {m.label}
              </div>
              <div className="text-sm font-semibold text-gray-700">
                {m.value}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
