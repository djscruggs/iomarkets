import { createRequestHandler } from "@react-router/node";
import { installGlobals } from "@react-router/node";
import { createServer } from "node:http";

installGlobals();

const port = process.env.PORT || 3000;

// Dynamically import the server build
const build = await import("./build/server/index.js");
const handler = createRequestHandler(build);

const server = createServer(async (req, res) => {
  try {
    const request = new Request(`http://${req.headers.host}${req.url}`, {
      method: req.method,
      headers: req.headers,
      body: req.method !== "GET" && req.method !== "HEAD" ? req : undefined,
    });

    const response = await handler(request);

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
