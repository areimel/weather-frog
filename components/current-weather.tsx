import type { CurrentWeatherData } from "@/lib/types";

interface CurrentWeatherProps {
  data: CurrentWeatherData;
  locationName: string;
}

function formatTime(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function CurrentWeather({ data, locationName }: CurrentWeatherProps) {
  return (
    <div className="flex flex-col justify-center gap-4 rounded-2xl bg-white/70 backdrop-blur-sm p-6 shadow-sm">
      <div>
        <div className="text-6xl font-light text-gray-800">{data.temp}°F</div>
        <div className="text-xl font-medium text-gray-600 mt-1 capitalize">
          {data.description}
        </div>
        <div className="text-sm text-gray-500 mt-1">
          📍 {locationName}
        </div>
        <div className="text-sm text-gray-400 mt-1">
          Feels like {data.feelsLike}° · H:{data.tempMax}° L:{data.tempMin}°
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-sm text-gray-600">
        <div className="flex items-center gap-1.5">
          <span>💧</span>
          <span>Humidity {data.humidity}%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>💨</span>
          <span>Wind {data.windSpeed} mph</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>👁</span>
          <span>Vis {data.visibility} mi</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>🌅</span>
          <span>{formatTime(data.sunrise)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>🌇</span>
          <span>{formatTime(data.sunset)}</span>
        </div>
      </div>
    </div>
  );
}
