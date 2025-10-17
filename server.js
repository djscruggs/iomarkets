import { createServer } from "node:http";
import { Readable } from "node:stream";

const port = process.env.PORT || 3000;

// Import the server build - it exports a default handler function
const build = await import("./build/server/index.js");
const handler = build.default;

const server = createServer(async (req, res) => {
  try {
    // Convert Node.js request to Web Request
    const url = new URL(req.url, `http://${req.headers.host}`);

    let body;
    if (req.method !== "GET" && req.method !== "HEAD") {
      body = Readable.toWeb(req);
    }

    const request = new Request(url.href, {
      method: req.method,
      headers: req.headers,
      body,
    });

    // Call the React Router handler
    const response = await handler(request);

    // Convert Web Response to Node.js response
    res.writeHead(response.status, Object.fromEntries(response.headers));

    if (response.body) {
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
    }

    res.end();
  } catch (error) {
    console.error("Error handling request:", error);
    res.writeHead(500);
    res.end("Internal Server Error");
  }
});

server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
