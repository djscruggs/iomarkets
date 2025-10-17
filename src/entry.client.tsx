import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";
import { ClerkProvider } from "@clerk/clerk-react";

const clerkPubKey =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
  "pk_test_YXJ0aXN0aWMtZWxrLTI2LmNsZXJrLmFjY291bnRzLmRldiQ";

if (!clerkPubKey) {
  throw new Error(
    "Missing Clerk Publishable Key - check your environment variables"
  );
}

if (!clerkPubKey.startsWith("pk_")) {
  throw new Error("Invalid Clerk Publishable Key - must start with 'pk_'");
}

hydrateRoot(
  document,
  <StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
      <HydratedRouter />
    </ClerkProvider>
  </StrictMode>
);
