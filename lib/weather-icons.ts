/**
 * Maps OpenWeatherMap icon codes to Meteocons Iconify icon names
 */
const WEATHER_ICON_MAP: Record<string, string> = {
  "01d": "meteocons:clear-day-fill",
  "01n": "meteocons:clear-night-fill",
  "02d": "meteocons:partly-cloudy-day-fill",
  "02n": "meteocons:partly-cloudy-night-fill",
  "03d": "meteocons:cloudy-fill",
  "03n": "meteocons:cloudy-fill",
  "04d": "meteocons:overcast-fill",
  "04n": "meteocons:overcast-fill",
  "09d": "meteocons:drizzle-fill",
  "09n": "meteocons:drizzle-fill",
  "10d": "meteocons:partly-cloudy-day-rain-fill",
  "10n": "meteocons:partly-cloudy-night-rain-fill",
  "11d": "meteocons:thunderstorms-fill",
  "11n": "meteocons:thunderstorms-fill",
  "13d": "meteocons:snow-fill",
  "13n": "meteocons:snow-fill",
  "50d": "meteocons:fog-fill",
  "50n": "meteocons:fog-fill",
};

const FALLBACK_ICON = "meteocons:thermometer-fill";

/**
 * Get the Meteocons Iconify icon name for an OpenWeatherMap icon code
 * @param iconCode OpenWeatherMap icon code (e.g., "01d", "02n")
 * @returns Meteocons Iconify icon name
 */
export function getWeatherIcon(iconCode: string): string {
  return WEATHER_ICON_MAP[iconCode] ?? FALLBACK_ICON;
}
