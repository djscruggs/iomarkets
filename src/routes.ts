import {
  type RouteConfig,
  index,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("dashboard", "routes/dashboard.tsx"),
  route("bookmarks", "routes/bookmarks.tsx"),
  route("investment/:id", "routes/investment.$id.tsx"),
  route("investment/:id/due-diligence", "routes/investment.$id.due-diligence.tsx"),
  route("sponsor/:sponsorId/deals", "routes/sponsor.$sponsorId.deals.tsx"),
  route("sponsor/:sponsorId/deals/:dealId", "routes/sponsor.$sponsorId.deals.$dealId.tsx"),
  route("api/chat", "routes/api.chat.ts"),
  route("api/bookmarks", "routes/api.bookmarks.ts"),
] satisfies RouteConfig;
