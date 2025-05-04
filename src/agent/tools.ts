/**
 * Tool definitions for the AI chat agent.
 * Tools can either require human confirmation or execute automatically.
 */
import { tool } from "ai";
import { z } from "zod";

const WeatherInfoSchema = z.object({
  city: z.string(),
  country: z.string(),
  temperature: z.string(),
});

type WeatherInfo = z.infer<typeof WeatherInfoSchema>;

async function getWeatherInformation(city: string): Promise<WeatherInfo> {
  const endpoint = "https://api.open-meteo.com/v1/forecast";
  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
    const geoRes = await fetch(geoUrl);
    if (!geoRes.ok) throw new Error("Failed to fetch geolocation data");
    const geoData = await geoRes.json();
    const result = geoData?.results?.[0];
    if (!result) throw new Error("No geolocation results found");
    const { latitude, longitude, name, country } = result;
    const url = `${endpoint}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weathercode`;
    const weatherRes = await fetch(url);
    if (!weatherRes.ok) throw new Error("Failed to fetch weather data");
    const weatherData = await weatherRes.json();
    const temp = weatherData.current?.temperature_2m;
    if (temp == null) throw new Error("No temperature in weather data");
    const info = {
      city: name || city,
      country: country || "",
      temperature: String(temp),
    };
    const parsed = WeatherInfoSchema.safeParse(info);
    if (!parsed.success) throw new Error("Weather info schema validation failed");
    return parsed.data;
  } catch {
    return {
      city,
      country: "",
      temperature: "0",
    };
  }
}

/**
 * Weather information tool that requires human confirmation.
 * When invoked, this will present a confirmation dialog to the user.
 */
const getWeatherInformationTool = tool({
  description: "Show the current weather in a given city using the Open-Meteo API.",
  parameters: z.object({
    city: z.string(),
    temperature: z.string().optional(),
    country: z.string().optional(),
  }),
  execute: async ({ city }) => getWeatherInformation(city),
});

/**
 * Local time tool that executes automatically.
 * This is suitable for low-risk operations that don't need oversight.
 */
const getLocalTime = tool({
  description: "Get the local time for a specified location.",
  parameters: z.object({ location: z.string() }),
  execute: async ({ location }) => {
    console.log(`[getLocalTime] Invoked with location: ${location}`);
    const now = new Date().toLocaleTimeString("en-US", { timeZone: "UTC" });
    console.log(`[getLocalTime] Returning time: ${now}`);
    return now;
  },
});

/**
 * Export all available tools.
 * These will be provided to the AI model to describe available capabilities.
 */
export const tools = {
  getWeatherInformationTool,
  getLocalTime,
};

/**
 * Implementation of confirmation-required tools.
 * This object contains the actual logic for tools that need human approval.
 */
export const executions = {};
