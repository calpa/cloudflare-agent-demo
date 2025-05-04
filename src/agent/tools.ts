/**
 * Tool definitions for the AI chat agent.
 * Tools can either require human confirmation or execute automatically.
 */
import { getWeatherInformationTool } from "./tools/getWeatherInformationTool";
import { getLocalTimeTool } from "./tools/getLocalTimeTool";
/**
 * All available tools provided to the AI agent.
 */
export const tools = {
  getWeatherInformationTool,
  getLocalTimeTool,
};

/**
 * Explicit implementation of confirmation-required tools.
 * Add tool logic here for tools requiring human approval.
 */
export const executions = {};
