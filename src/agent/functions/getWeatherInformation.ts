import { WeatherInfo, WeatherInfoSchema } from "../../types/weatherInfo";

/**
 * Fetches current weather information for a given city using the Open-Meteo APIs.
 *
 * Resolves city coordinates via the geocoding API, then retrieves temperature data.
 *
 * @param city - The name of the city to fetch weather data for.
 * @returns A Promise that resolves to a WeatherInfo object containing city, country, and temperature.
 */
export async function getWeatherInformation(city: string): Promise<WeatherInfo> {
  const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
  const weatherBaseUrl = "https://api.open-meteo.com/v1/forecast";
  try {
    const geoRes = await fetch(geocodeUrl);
    if (!geoRes.ok) throw new Error("Failed to fetch geolocation data");
    const geoData = await geoRes.json();
    const place = geoData?.results?.[0];
    if (!place) throw new Error("City not found");
    const { latitude, longitude, name, country } = place;

    const weatherUrl = `${weatherBaseUrl}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m`;
    const weatherRes = await fetch(weatherUrl);
    if (!weatherRes.ok) throw new Error("Failed to fetch weather data");
    const weatherData = await weatherRes.json();
    const temperature = weatherData?.current?.temperature_2m;
    if (temperature === undefined || temperature === null) throw new Error("Temperature data missing");

    return WeatherInfoSchema.parse({
      city: name || city,
      country: country ?? "",
      temperature: String(temperature),
    });
  } catch (err) {
    console.error(`[getWeatherInformation] ${err instanceof Error ? err.message : err}`);
    return {
      city,
      country: "",
      temperature: "0",
    };
  }
}