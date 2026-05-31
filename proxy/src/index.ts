/**
 * Hardened Pinboard API Proxy (v1.2)
 * Handles CORS, isolates body stream failures, and protects downstream error visibility.
 * QUANTUM LEAP: Includes XML-to-JSON transformation for legacy /posts/dates endpoint.
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
    
    // QUANTUM LEAP: If this is /posts/dates, we fetch XML and convert to JSON
    // because Pinboard's JSON dates endpoint returns 0 bytes for large accounts.
    const isDatesRequest = targetPath.endsWith('/posts/dates');
    const pinboardUrl = new URL(`https://api.pinboard.in${targetPath}`);
    
    const requestUrlParams = new URLSearchParams(url.search);
    if (isDatesRequest) {
      // Remove format=json to get authoritative XML
      requestUrlParams.delete('format');
    }
    pinboardUrl.search = requestUrlParams.toString();

    // 3. Prepare clean headers - Surgical Strike: Strip EVERYTHING except essentials
    const headers = new Headers();
    headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36");
    headers.set("Accept", isDatesRequest ? "application/xml" : "application/json");
    headers.set("Accept-Encoding", "identity"); // Force no compression to avoid upstream failures
    
    const importantHeaders = ["Authorization", "Content-Type"];
    for (const h of importantHeaders) {
      if (request.headers.has(h)) {
        headers.set(h, request.headers.get(h)!);
      }
    }

    // 4. Safely extract body if applicable
    let requestBody: any = null;
    const hasBody = request.method !== "GET" && request.method !== "HEAD" && request.body;
    if (hasBody) {
      requestBody = request.body;
    }

    // 5. Execute proxy call
    try {
      console.log(`[Proxy] Fetching: ${pinboardUrl.toString()}`);
      const response = await fetch(pinboardUrl.toString(), {
        method: request.method,
        headers: headers,
        body: requestBody,
        redirect: "follow",
      });

      console.log(`[Proxy] Upstream Response: ${response.status} ${response.statusText}`);
      
      let finalResponseBody: any;
      const responseHeaders = new Headers(response.headers);
      
      if (isDatesRequest && response.ok) {
        console.log('[Proxy] Quantum Leap: Transforming XML Dates to JSON');
        const xmlText = await response.text();
        console.log(`[Proxy] XML Start: ${xmlText.substring(0, 1000)}`);
        
        // Match <date date="YYYY-MM-DD" count="X" /> or <date count="X" date="YYYY-MM-DD" />
        // Handles both self-closing /> and separate </date> tags.
        // Handles both single ' and double " quotes.
        const dateMatches = xmlText.matchAll(/<date\s+([^>]+)\/?>/g);
        const dates: Record<string, string> = {};
        let matchCount = 0;
        for (const match of dateMatches) {
          const attrText = match[1];
          const dateMatch = attrText.match(/date=["']([^"']+)["']/);
          const countMatch = attrText.match(/count=["'](\d+)["']/);
          if (dateMatch && countMatch) {
            dates[dateMatch[1]] = countMatch[1];
            matchCount++;
          }
        }
        console.log(`[Proxy] Quantum Leap: Found ${matchCount} dates in XML`);
        if (matchCount > 0) {
          const firstKey = Object.keys(dates)[0];
          console.log(`[Proxy] Sample Date: ${firstKey} = ${dates[firstKey]}`);
        }
        
        const jsonResponse = {
          user: requestUrlParams.get('user') || '',
          tag: requestUrlParams.get('tag') || '',
          dates: dates
        };
        
        finalResponseBody = JSON.stringify(jsonResponse);
        responseHeaders.set("Content-Type", "application/json; charset=utf-8");
      } else {
        finalResponseBody = await response.arrayBuffer();
      }

      // 6. Build clean response headers
      // Strip any accidental pre-existing CORS headers to prevent duplicates
      responseHeaders.delete("Access-Control-Allow-Origin");
      responseHeaders.delete("Access-Control-Allow-Methods");
      responseHeaders.delete("Access-Control-Allow-Headers");

      // Inject our verified CORS headers
      Object.entries(CORS_HEADERS).forEach(([key, value]) => {
        responseHeaders.set(key, value);
      });

      return new Response(finalResponseBody, {
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
