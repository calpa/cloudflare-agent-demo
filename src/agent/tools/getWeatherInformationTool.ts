import { tool } from "ai";
import { getWeatherInformation } from "../functions/getWeatherInformation";
import { z } from "zod";

/**
 * Tool for retrieving current weather information for a specified city.
 *
 * This tool fetches real-time weather data using the Open-Meteo API.
 * Returns the city, country, and temperature. Human approval is required before execution.
 */
export const getWeatherInformationTool = tool({
  description: "Display the current weather in a specified city using the Open-Meteo API.",
  parameters: z.object({
    city: z.string().describe("City name to fetch weather for."),
    temperature: z.string().optional().describe("Temperature (optional, usually returned by the tool)"),
    country: z.string().optional().describe("Country name (optional, usually returned by the tool)"),
  }),
  execute: async ({ city }) => getWeatherInformation(city),
});