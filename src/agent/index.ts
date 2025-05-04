import { type Schedule } from "agents";
import { AIChatAgent } from "agents/ai-chat-agent";
import {
  createDataStreamResponse,
  generateId,
  streamText,
  type StreamTextOnFinishCallback,
  type ToolSet,
} from "ai";
import { createWorkersAI } from "workers-ai-provider";
import { processToolCalls } from "./utils";
import { tools, executions } from "./tools";
import { env } from "cloudflare:workers";

const workersai = createWorkersAI({ binding: env.AI });
const model = workersai("@cf/meta/llama-3.2-1b-instruct");

/**
 * Chat Agent implementation handling real-time AI chat interactions.
 * Extends {@link AIChatAgent} to provide message streaming, tool integration, and scheduling support.
 */
export class Chat extends AIChatAgent<Env> {
  /**
   * Called when the chat agent starts.
   * Logs agent startup event.
   */
  onStart() {
    console.log("Chat agent started");
  }

  /**
   * Called when a new client connects to the agent.
   * Logs connection event.
   */
  onConnect() {
    console.log("New client connected");
  }

  /**
   * Handles incoming chat messages and manages the response stream.
   * Processes tool invocations and generates streaming AI responses.
   * 
   * @param onFinish - Callback executed when streaming completes
   * @param options - Optional abort signal for cancellation
   * @returns A DataStream response for the chat interaction
   */
  async onChatMessage(
    onFinish: StreamTextOnFinishCallback<ToolSet>,
    options?: { abortSignal?: AbortSignal }
  ) {
    console.log("onChatMessage: Received new chat message.");
    const allTools = {
      ...tools,
      ...this.mcp.unstable_getAITools(),
    };

    const dataStreamResponse = createDataStreamResponse({
      execute: async (dataStream) => {
        console.log("onChatMessage: Processing tool calls...");
        const processedMessages = await processToolCalls({
          messages: this.messages,
          dataStream,
          tools: allTools,
          executions,
        });
        console.log("onChatMessage: Tool calls processed.");

        const systemPrompt = [
          "You are a helpful assistant that can do various tasks...",
          // unstable_getSchedulePrompt({ date: new Date() }),
          // "If the user asks to schedule a task, use the schedule tool to schedule the task.",
        ].join("\n\n");

        console.log("onChatMessage: Starting streaming of AI response.", systemPrompt);
        const result = streamText({
          model,
          system: systemPrompt,
          messages: processedMessages,
          tools: allTools,
          onFinish: async (args) => {
            console.log("onChatMessage: Streaming finished.", args);
            onFinish(args as Parameters<StreamTextOnFinishCallback<ToolSet>>[0]);
          },
          onError: (error) => {
            console.error("Error while streaming:", error);
          },
          maxSteps: 10,
          ...(options?.abortSignal ? { abortSignal: options.abortSignal } : {}),
        });

        result.mergeIntoDataStream(dataStream);
        console.log("onChatMessage: Merged streaming result into data stream.");
      },
    });

    console.log("onChatMessage: Returning data stream response.");
    return dataStreamResponse;
  }

  /**
   * Executes a scheduled task and logs the event in the conversation.
   * 
   * @param description - Description of the scheduled task
   * @param task - The scheduled task details
   */
  async executeTask(description: string, task: Schedule<string>) {
    console.log(`executeTask: Executing scheduled task: ${description}`);
    await this.saveMessages([
      ...this.messages,
      {
        id: generateId(),
        role: "user",
        content: `Running scheduled task: ${description}`,
        createdAt: new Date(),
      },
    ]);
    // Optionally, add real scheduling logic here
    console.log("executeTask: Scheduled task message saved.");
  }
}
