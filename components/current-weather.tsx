import type { CurrentWeatherData } from "@/lib/types";
import { Icon } from "@iconify/react";
import { getWeatherIcon } from "@/lib/weather-icons";

interface CurrentWeatherProps {
  data: CurrentWeatherData;
  locationName: string;
}

export function CurrentWeather({ data, locationName }: CurrentWeatherProps) {
  return (
    <div className="text-shadow-hero">
      {/* Location */}
      <div className="text-sm text-white/80 font-medium mb-1 flex items-center gap-1.5">
        <Icon icon="lucide:map-pin" className="w-3.5 h-3.5" />
        {locationName}
      </div>
      {/* Temperature */}
      <div className="flex items-start gap-3">
        <span className="text-7xl font-light text-white tracking-tight">
          {data.temp}°
        </span>
        <Icon
          icon={getWeatherIcon(data.icon)}
          className="w-12 h-12 mt-2 text-white drop-shadow-lg"
        />
      </div>
      {/* Description */}
      <div className="text-xl text-white/90 font-medium capitalize mt-1">
        {data.description}
      </div>
      {/* Feels like + H/L */}
      <div className="text-sm text-white/70 mt-1">
        Feels like {data.feelsLike}° · H:{data.tempMax}° L:{data.tempMin}°
      </div>
    </div>
  );
}
