import { z } from "zod";

/**
 * Zod schema for weather information.
 * Represents the structure of weather data for a specific city and country.
 */
export const WeatherInfoSchema = z.object({
  /**
   * The name of the city.
   */
  city: z.string(),
  /**
   * The name of the country.
   */
  country: z.string(),
  /**
   * The temperature reading (as a string).
   */
  temperature: z.string(),
});

/**
 * TypeScript type representing validated weather information.
 */
export type WeatherInfo = z.infer<typeof WeatherInfoSchema>;