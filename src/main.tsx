import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import { BrowserRouter } from "react-router";
import "./index.css";
import App from "./App";

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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ClerkProvider>
  </StrictMode>
);
