import type { NextRequest } from "next/server";
import type {
  WeatherResponse,
  CurrentWeatherData,
  HourlyDataPoint,
  DailyDataPoint,
} from "@/lib/types";
import {
  getCachedWeather,
  setCachedWeather,
  cleanExpiredEntries,
} from "@/lib/cache";

const OWM_BASE = "https://api.openweathermap.org/data/2.5";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return Response.json({ error: "lat and lon are required" }, { status: 400 });
  }

  const latNum = parseFloat(lat);
  const lonNum = parseFloat(lon);
  if (isNaN(latNum) || isNaN(lonNum) || latNum < -90 || latNum > 90 || lonNum < -180 || lonNum > 180) {
    return Response.json({ error: "Invalid coordinates" }, { status: 400 });
  }

  // Check cache first
  const cached = getCachedWeather(latNum, lonNum);
  if (cached) {
    return Response.json(cached, {
      headers: { "X-Cache": "HIT" },
    });
  }

  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Weather API key not configured" },
      { status: 500 }
    );
  }

  const params = new URLSearchParams({
    lat,
    lon,
    appid: apiKey,
    units: "imperial",
  });

  // Fetch current weather and 5-day forecast in parallel
  const [currentRes, forecastRes] = await Promise.all([
    fetch(`${OWM_BASE}/weather?${params}`),
    fetch(`${OWM_BASE}/forecast?${params}`),
  ]);

  if (!currentRes.ok || !forecastRes.ok) {
    return Response.json(
      { error: "Failed to fetch weather data" },
      { status: 502 }
    );
  }

  const currentData = await currentRes.json();
  const forecastData = await forecastRes.json();

  // Shape current weather
  const current: CurrentWeatherData = {
    temp: Math.round(currentData.main.temp),
    feelsLike: Math.round(currentData.main.feels_like),
    tempMin: Math.round(currentData.main.temp_min),
    tempMax: Math.round(currentData.main.temp_max),
    humidity: currentData.main.humidity,
    windSpeed: Math.round(currentData.wind.speed),
    visibility: Math.round((currentData.visibility ?? 10000) / 1609.34), // meters to miles
    conditionId: currentData.weather[0].id,
    condition: currentData.weather[0].main,
    description: currentData.weather[0].description,
    icon: currentData.weather[0].icon,
    sunrise: currentData.sys.sunrise,
    sunset: currentData.sys.sunset,
  };

  // Shape hourly forecast (next 8 intervals from the 3-hour forecast)
  const hourly: HourlyDataPoint[] = forecastData.list.slice(0, 8).map(
    (item: Record<string, unknown>) => ({
      dt: (item as { dt: number }).dt,
      temp: Math.round((item as { main: { temp: number } }).main.temp),
      conditionId: (item as { weather: { id: number }[] }).weather[0].id,
      condition: (item as { weather: { main: string }[] }).weather[0].main,
      icon: (item as { weather: { icon: string }[] }).weather[0].icon,
      pop: (item as { pop?: number }).pop ?? 0,
    })
  );

  // Aggregate daily forecast (group by date, take min/max temps)
  const dailyMap = new Map<
    string,
    { dt: number; temps: number[]; conditions: { id: number; main: string; icon: string }[]; pops: number[] }
  >();

  for (const item of forecastData.list) {
    const date = new Date(item.dt * 1000).toISOString().split("T")[0];
    if (!dailyMap.has(date)) {
      dailyMap.set(date, { dt: item.dt, temps: [], conditions: [], pops: [] });
    }
    const day = dailyMap.get(date)!;
    day.temps.push(item.main.temp);
    day.conditions.push({
      id: item.weather[0].id,
      main: item.weather[0].main,
      icon: item.weather[0].icon,
    });
    day.pops.push(item.pop ?? 0);
  }

  // Skip the first (partial current) day, take next 5 days
  const daily: DailyDataPoint[] = [...dailyMap.entries()]
    .slice(1, 6)
    .map(([, data]) => {
      // Pick the most common condition for the day (midday-biased)
      const midCondition =
        data.conditions[Math.floor(data.conditions.length / 2)];
      return {
        dt: data.dt,
        tempMin: Math.round(Math.min(...data.temps)),
        tempMax: Math.round(Math.max(...data.temps)),
        conditionId: midCondition.id,
        condition: midCondition.main,
        icon: midCondition.icon,
        pop: Math.max(...data.pops),
      };
    });

  const response: WeatherResponse = { current, hourly, daily };

  // Cache the response and periodically clean expired entries
  setCachedWeather(latNum, lonNum, response);
  if (Math.random() < 0.05) cleanExpiredEntries();

  return Response.json(response, {
    headers: { "X-Cache": "MISS" },
  });
}
