export const ORDERED_CODES = [
  "01", "02", "03", "04",
  "05", "06", "07", "08",
  "09",
  "10", "11", "12",
  "13", "15", "16", "17",
  "19", "20",
  "22", "24",
  "25", "26",
] as const;

export type FrogCode = (typeof ORDERED_CODES)[number];

export const WEATHER_CODE_LABELS: Record<FrogCode, string> = {
  "01": "Sunny",
  "02": "Mostly Sunny",
  "03": "Partly Cloudy",
  "04": "Mostly Cloudy",
  "05": "Clear Night",
  "06": "Mostly Clear Night",
  "07": "Partly Cloudy Night",
  "08": "Mostly Cloudy Night",
  "09": "Cloudy",
  "10": "Drizzle",
  "11": "Rain",
  "12": "Heavy Rain",
  "13": "Flurries",
  "15": "Snow Showers",
  "16": "Blowing Snow",
  "17": "Blizzard",
  "19": "Mixed Precip",
  "20": "Wintry Mix",
  "22": "Thunderstorms",
  "24": "Strong Storms",
  "25": "Breezy / Windy",
  "26": "Haze / Fog",
};
