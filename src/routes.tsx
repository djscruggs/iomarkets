import {
  type RouteConfig,
  index,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("dashboard", "routes/dashboard.tsx"),
  route("investment/:id", "routes/investment.$id.tsx"),
  route("investment/:id/due-diligence", "routes/investment.$id.due-diligence.tsx"),
  route("sponsor/:sponsorId/deals", "routes/sponsor.$sponsorId.deals.tsx"),
  route("sponsor/:sponsorId/deals/:dealId", "routes/sponsor.$sponsorId.deals.$dealId.tsx"),
] satisfies RouteConfig;
