import type { NextRequest } from "next/server";
import { getCachedGeocode, setCachedGeocode } from "@/lib/cache";

const OWM_GEO = "https://api.openweathermap.org/geo/1.0/direct";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");

  if (!q) {
    return Response.json({ error: "q (query) is required" }, { status: 400 });
  }

  // Check cache first
  const cached = getCachedGeocode(q);
  if (cached) {
    return Response.json(cached, {
      headers: { "X-Cache": "HIT" },
    });
  }

  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  const params = new URLSearchParams({
    q,
    limit: "5",
    appid: apiKey,
  });

  const res = await fetch(`${OWM_GEO}?${params}`);
  if (!res.ok) {
    return Response.json({ error: "Geocoding failed" }, { status: 502 });
  }

  const data = await res.json();
  const results = data.map(
    (item: { name: string; lat: number; lon: number; country: string; state?: string }) => ({
      name: item.name,
      lat: item.lat,
      lon: item.lon,
      country: item.country,
      state: item.state,
    })
  );

  setCachedGeocode(q, results);

  return Response.json(results, {
    headers: { "X-Cache": "MISS" },
  });
}
