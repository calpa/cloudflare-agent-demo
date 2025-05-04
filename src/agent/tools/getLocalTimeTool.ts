import { tool } from "ai";
import { z } from "zod";
import moment from "moment-timezone";
import { getTimezoneForLocation } from "../functions/getTimezoneForLocation";

/**
 * Tool for fetching the current local time for a given location.
 * 
 * This tool uses the Open-Meteo Geocoding API to resolve the timezone
 * based on a location string (city, country, etc.), and then returns
 * the current time in that timezone, formatted as "HH:mm:ss z".
 * If the timezone cannot be determined, it falls back to UTC.
 */
export const getLocalTimeTool = tool({
  description: "Obtain the current local time for a specified location.",
  parameters: z.object({
    location: z.string().describe("Location to determine the local time for (city, country, etc.)"),
  }),
  execute: async ({ location }) => {
    console.info(`[getLocalTime] Invoked with location: ${location}`);
    const timezone = await getTimezoneForLocation(location);
    const now = timezone
      ? moment().tz(timezone).format("HH:mm:ss z")
      : moment().utc().format("HH:mm:ss [UTC]");
    console.info(`[getLocalTime] Returning time: ${now}`);
    return now;
  },
});