/**
 * Retrieves the IANA timezone string for a given location using the Open-Meteo Geocoding API.
 *
 * @param location - The name of the location (city, country, etc.) to look up.
 * @returns A Promise that resolves to the timezone string (e.g., "America/New_York"), or null if not found or on error.
 */
export async function getTimezoneForLocation(location: string): Promise<string | null> {
  if (!location?.trim()) return null;
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`;
  try {
    const response = await fetch(geoUrl);
    if (!response.ok) return null;
    const data = await response.json();
    const timezone = data?.results?.[0]?.timezone;
    return typeof timezone === "string" && timezone.length > 0 ? timezone : null;
  } catch (err) {
    console.error(`[getTimezoneForLocation] ${err instanceof Error ? err.message : String(err)}`);
    return null;
  }
}