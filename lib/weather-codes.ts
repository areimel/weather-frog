// Maps OpenWeatherMap condition IDs to frog image codes.
// OWM docs: https://openweathermap.org/weather-conditions
// Frog codes correspond to image filename prefixes (01-26).

interface FrogCodeMapping {
  day: string;
  night: string;
  label: string;
}

const WEATHER_CODE_MAP: Record<number, FrogCodeMapping> = {};

function mapRange(start: number, end: number, mapping: FrogCodeMapping) {
  for (let id = start; id <= end; id++) {
    WEATHER_CODE_MAP[id] = mapping;
  }
}

// Thunderstorm group (2xx)
mapRange(200, 202, { day: "22", night: "22", label: "Iso Thunderstorms" });
mapRange(210, 232, { day: "24", night: "24", label: "Strong Thunderstorms" });

// Drizzle group (3xx)
mapRange(300, 321, { day: "10", night: "10", label: "Drizzle" });

// Rain group (5xx)
mapRange(500, 501, { day: "11", night: "11", label: "Rain" });
mapRange(502, 531, { day: "12", night: "12", label: "Heavy Rain" });

// Snow group (6xx)
mapRange(600, 601, { day: "15", night: "15", label: "Snow Showers" });
WEATHER_CODE_MAP[602] = { day: "17", night: "17", label: "Heavy Snow Blizzard" };
mapRange(611, 616, { day: "19", night: "19", label: "Mixed" });
mapRange(620, 622, { day: "13", night: "13", label: "Flurries" });

// Atmosphere group (7xx)
mapRange(701, 762, { day: "26", night: "26", label: "Haze/Fog" });
mapRange(771, 781, { day: "25", night: "25", label: "Windy" });

// Clear & clouds (8xx) — day/night variants
WEATHER_CODE_MAP[800] = { day: "01", night: "05", label: "Clear" };
WEATHER_CODE_MAP[801] = { day: "02", night: "06", label: "Few Clouds" };
WEATHER_CODE_MAP[802] = { day: "03", night: "07", label: "Partly Cloudy" };
WEATHER_CODE_MAP[803] = { day: "04", night: "08", label: "Mostly Cloudy" };
WEATHER_CODE_MAP[804] = { day: "04", night: "08", label: "Overcast" };

const FALLBACK_CODE = "01"; // sunny as ultimate fallback

export function getFrogCode(
  conditionId: number,
  isNight: boolean
): string {
  const mapping = WEATHER_CODE_MAP[conditionId];
  if (!mapping) return FALLBACK_CODE;
  return isNight ? mapping.night : mapping.day;
}

export function isNightTime(now: number, sunrise: number, sunset: number): boolean {
  return now < sunrise || now > sunset;
}
