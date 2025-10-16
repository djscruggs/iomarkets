import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import routes from "./routes";

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

const router = createBrowserRouter(routes);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
      <RouterProvider router={router} />
    </ClerkProvider>
  </StrictMode>
);
