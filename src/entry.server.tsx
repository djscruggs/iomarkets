import type { RenderToReadableStreamOptions } from "react-dom/server";
import { renderToReadableStream } from "react-dom/server";
import { ServerRouter } from "react-router";
import type { EntryContext } from "react-router";
import { ClerkProvider } from "@clerk/clerk-react";

const clerkPubKey =
  process.env.VITE_CLERK_PUBLISHABLE_KEY ||
  "pk_test_YXJ0aXN0aWMtZWxrLTI2LmNsZXJrLmFjY291bnRzLmRldiQ";

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  entryContext: EntryContext,
  loadContext: unknown
) {
  const body = await renderToReadableStream(
    <ClerkProvider publishableKey={clerkPubKey}>
      <ServerRouter context={entryContext} url={request.url} />
    </ClerkProvider>,
    {
      signal: request.signal,
      onError(error: unknown) {
        console.error(error);
        responseStatusCode = 500;
      },
    } as RenderToReadableStreamOptions
  );

  responseHeaders.set("Content-Type", "text/html");

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
