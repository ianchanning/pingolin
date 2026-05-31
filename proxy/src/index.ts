/**
 * Hardened Pinboard API Proxy (v1.1)
 * Handles CORS, isolates body stream failures, and protects downstream error visibility.
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
  "Access-Control-Max-Age": "86400",
};

export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    const url = new URL(request.url);
    
    // 1. Handle CORS preflight requests (Early return to preserve compute)
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: CORS_HEADERS,
      });
    }

    // 2. Construct and normalize the Pinboard API URL
    let targetPath = url.pathname;
    if (!targetPath.startsWith('/v1/')) {
      targetPath = '/v1' + (targetPath.startsWith('/') ? targetPath : '/' + targetPath);
    }
    
    const pinboardUrl = new URL(`https://api.pinboard.in${targetPath}`);
    pinboardUrl.search = url.search;

    // 3. Prepare clean headers
    const headers = new Headers(request.headers);
    headers.set("User-Agent", "PinboardPWA/1.0");
    
    // Remove headers that cause routing/security rejections upstream
    headers.delete("Host");
    headers.delete("Origin");
    headers.delete("Referer");

    // 4. Safely extract body if applicable
    let requestBody: ArrayBuffer | null = null;
    const hasBody = request.method !== "GET" && request.method !== "HEAD" && request.body;
    if (hasBody) {
      try {
        requestBody = await request.arrayBuffer();
      } catch (e) {
        console.warn("Body extraction failed or empty stream parsed:", e);
      }
    }

    // 5. Execute proxy call
    try {
      const response = await fetch(pinboardUrl.toString(), {
        method: request.method,
        headers: headers,
        body: requestBody,
        redirect: "follow",
      });

      // 6. Build clean response headers
      const responseHeaders = new Headers(response.headers);
      
      // Strip any accidental pre-existing CORS headers to prevent duplicates
      responseHeaders.delete("Access-Control-Allow-Origin");
      responseHeaders.delete("Access-Control-Allow-Methods");
      responseHeaders.delete("Access-Control-Allow-Headers");

      // Inject our verified CORS headers
      Object.entries(CORS_HEADERS).forEach(([key, value]) => {
        responseHeaders.set(key, value);
      });

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    } catch (error) {
      console.error("Proxy Failure:", error);
      
      const errorHeaders = new Headers(CORS_HEADERS);
      errorHeaders.set("Content-Type", "application/json");

      return new Response(JSON.stringify({ 
        error: "Proxy Network/Transit Failure", 
        message: (error as Error).message,
        url: pinboardUrl.toString()
      }), {
        status: 502, // Bad Gateway is semantically more correct than 500 for proxy errors
        headers: errorHeaders,
      });
    }
  },
};
