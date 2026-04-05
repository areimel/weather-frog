export interface Location {
  name: string;
  lat: number;
  lon: number;
  country?: string;
  state?: string;
}

export interface CurrentWeatherData {
  temp: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  windSpeed: number;
  visibility: number;
  conditionId: number;
  condition: string;
  description: string;
  icon: string;
  sunrise: number;
  sunset: number;
  uvIndex?: number;
}

export interface HourlyDataPoint {
  dt: number;
  temp: number;
  conditionId: number;
  condition: string;
  icon: string;
  pop: number; // probability of precipitation (0-1)
}

export interface DailyDataPoint {
  dt: number;
  tempMin: number;
  tempMax: number;
  conditionId: number;
  condition: string;
  icon: string;
  pop: number;
}

export interface WeatherResponse {
  current: CurrentWeatherData;
  hourly: HourlyDataPoint[];
  daily: DailyDataPoint[];
}
