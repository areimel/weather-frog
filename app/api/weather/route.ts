import type { NextRequest } from "next/server";
import type {
  WeatherResponse,
  CurrentWeatherData,
  HourlyDataPoint,
  DailyDataPoint,
} from "@/lib/types";

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
    pressure: currentData.main.pressure,
    cloudCover: currentData.clouds.all,
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
    { dt: number; temps: number[]; conditions: { id: number; main: string; icon: string }[]; pops: number[]; humidities: number[] }
  >();

  for (const item of forecastData.list) {
    const date = new Date(item.dt * 1000).toISOString().split("T")[0];
    if (!dailyMap.has(date)) {
      dailyMap.set(date, { dt: item.dt, temps: [], conditions: [], pops: [], humidities: [] });
    }
    const day = dailyMap.get(date)!;
    day.temps.push(item.main.temp);
    day.conditions.push({
      id: item.weather[0].id,
      main: item.weather[0].main,
      icon: item.weather[0].icon,
    });
    day.pops.push(item.pop ?? 0);
    day.humidities.push(item.main.humidity);
  }

  // Build "Today" entry from current weather + today's forecast intervals
  const dailyEntries = [...dailyMap.entries()];
  const todayData = dailyEntries[0]?.[1];
  const todayEntry: DailyDataPoint = {
    dt: currentData.dt,
    tempMin: Math.round(
      Math.min(current.temp, ...(todayData?.temps ?? [current.temp]))
    ),
    tempMax: Math.round(
      Math.max(current.temp, ...(todayData?.temps ?? [current.temp]))
    ),
    conditionId: current.conditionId,
    condition: current.condition,
    icon: current.icon,
    pop: todayData ? Math.max(...todayData.pops) : 0,
    humidity: todayData
      ? Math.round(todayData.humidities.reduce((a, b) => a + b, 0) / todayData.humidities.length)
      : currentData.main.humidity,
  };

  // Remaining forecast days
  const restDays: DailyDataPoint[] = dailyEntries.slice(1, 6).map(([, data]) => {
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
      humidity: Math.round(
        data.humidities.reduce((a, b) => a + b, 0) / data.humidities.length
      ),
    };
  });

  const daily: DailyDataPoint[] = [todayEntry, ...restDays];

  const response: WeatherResponse = { current, hourly, daily };
  return Response.json(response);
}
