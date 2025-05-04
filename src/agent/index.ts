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

const workersai = createWorkersAI({ binding: env.AI, gateway: {
  id: env.GATEWAY_ID,
} });
const model = workersai("@cf/meta/llama-3.2-1b-instruct");

export class Chat extends AIChatAgent<Env> {
  onStart() {
    console.info("[Chat] Agent started");
  }

  onConnect() {
    console.info("[Chat] Client connected");
  }

  async onChatMessage(
    onFinish: StreamTextOnFinishCallback<ToolSet>,
    options?: { abortSignal?: AbortSignal }
  ) {
    const allTools = {
      ...tools,
      ...this.mcp.unstable_getAITools(),
    };

    return createDataStreamResponse({
      execute: async (dataStream) => {
        const processedMessages = await processToolCalls({
          messages: this.messages,
          dataStream,
          tools: allTools,
          executions,
        });

        const systemPrompt = [
          "You are a helpful assistant that can do various tasks for the user.",
        ].join("\n\n");

        const result = streamText({
          model,
          system: systemPrompt,
          messages: processedMessages,
          tools: allTools,
          onFinish: async (args) => {
            onFinish(args as Parameters<StreamTextOnFinishCallback<ToolSet>>[0]);
          },
          onError: (error) => {
            console.error("[Chat] Error during streaming:", error);
          },
          maxSteps: 10,
          ...(options?.abortSignal ? { abortSignal: options.abortSignal } : {}),
        });

        result.mergeIntoDataStream(dataStream);
      },
    });
  }

  async executeTask(description: string, task: Schedule<string>) {
    await this.saveMessages([
      ...this.messages,
      {
        id: generateId(),
        role: "user",
        content: `Running scheduled task: ${description}`,
        createdAt: new Date(),
      },
    ]);
    // TODO: Implement actual scheduling logic if needed
  }
}
