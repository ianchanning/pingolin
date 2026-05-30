/**
 * Pinboard API Proxy
 * Handles CORS and injects required User-Agent for Pinboard API.
 */

export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    const url = new URL(request.url);
    
    // 1. Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    // 2. Construct the Pinboard API URL
    // Pinboard API base is https://api.pinboard.in/v1/
    // We normalize the path to ensure it starts with /v1/
    let targetPath = url.pathname;
    if (!targetPath.startsWith('/v1/')) {
      targetPath = '/v1' + (targetPath.startsWith('/') ? targetPath : '/' + targetPath);
    }
    
    const pinboardUrl = new URL(`https://api.pinboard.in${targetPath}`);
    pinboardUrl.search = url.search;

    // 3. Prepare headers
    const headers = new Headers(request.headers);
    
    // Mandatory User-Agent to avoid 500 errors from Pinboard
    headers.set("User-Agent", "PinboardPWA/1.0");
    
    // Remove headers that might cause issues with the target
    headers.delete("Host");
    headers.delete("Origin");
    headers.delete("Referer");

    // 4. Execute the request
    try {
      const response = await fetch(pinboardUrl.toString(), {
        method: request.method,
        headers: headers,
        // Forward body for POST requests
        body: (request.method !== "GET" && request.method !== "HEAD") ? await request.arrayBuffer() : null,
        redirect: "follow",
      });

      // 5. Return response with CORS headers
      const responseHeaders = new Headers(response.headers);
      responseHeaders.set("Access-Control-Allow-Origin", "*");
      
      // If Pinboard returns a 429, we pass it through (Roadmap requirement)
      // fetch's Response is already capturing the status correctly.

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    } catch (error) {
      console.error("Proxy Error:", error);
      return new Response(JSON.stringify({ 
        error: "Proxy Error", 
        message: (error as Error).message,
        url: pinboardUrl.toString()
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
  },
};
