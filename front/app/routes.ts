import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  // Public routes
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
  route("verify-otp", "routes/verify-otp.tsx"),
  route("integrations/callback", "routes/integrations.callback.tsx"),

  // Protected routes
  layout("routes/protected.tsx", [
    index("routes/home.tsx"),
    route("tasks", "routes/tasks.tsx"),
    route("insights", "routes/insights.tsx"),
    route("insights/posts/:postUuid", "routes/insights.post-detail.tsx"),
    route("scripts", "routes/scripts.tsx"),
    route("calendar", "routes/calendar.tsx"),
    route("settings", "routes/settings.tsx", [
      index("routes/settings.index.tsx"),
      route(":section", "routes/settings.section.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
