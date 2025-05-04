import { routeAgentRequest } from "agents";
export { Chat } from './agent';

/**
 * Worker entry point that routes incoming requests to the appropriate handler
 * Adds CORS headers to all responses, except for WebSocket upgrade requests.
 */
function withCORS(response: Response): Response {
  // Do not add CORS headers to WebSocket upgrade responses
  if (response.status === 101) return response;
  const newHeaders = new Headers(response.headers);
  newHeaders.set("Access-Control-Allow-Origin", "*");
  newHeaders.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  newHeaders.set("Access-Control-Allow-Headers", "Content-Type,Authorization");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    console.log(`[fetch] Incoming request: ${request.method} ${request.url}`);

    if (request.method === "OPTIONS") {
      console.log("[fetch] Handling CORS preflight request.");
      const response = withCORS(new Response(null, { status: 204 }));
      console.log("[fetch] Responded to OPTIONS with CORS headers.");
      return response;
    }

    try {
      console.log("[fetch] Routing agent request...");
      const routed = await routeAgentRequest(request, env);
      if (routed) {
        console.log("[fetch] Routed request successfully.");
      } else {
        console.warn("[fetch] No route matched. Returning 404.");
      }

      // For WebSocket upgrade responses, do not modify headers
      if (routed && routed.status === 101) {
        console.log("[fetch] WebSocket upgrade response detected.");
        return routed;
      }

      const response = routed || new Response("Not found", { status: 404 });
      const responseWithCORS = withCORS(response);
      console.log(`[fetch] Responding with status: ${responseWithCORS.status}`);
      return responseWithCORS;
    } catch (error) {
      console.error("[fetch] Error handling request:", error);
      const errorResponse = withCORS(new Response("Internal Server Error", { status: 500 }));
      return errorResponse;
    }
  },
} satisfies ExportedHandler<Env>;
