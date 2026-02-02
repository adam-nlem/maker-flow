import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  // Public routes
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
  route("integrations/callback", "routes/integrations.callback.tsx"),

  // Protected routes
  layout("routes/protected.tsx", [
    index("routes/home.tsx"),
    route("library", "routes/library.tsx"),
    route("modules/:moduleIdentifier/*", "routes/modules.$moduleIdentifier.tsx"),
  ]),
] satisfies RouteConfig;
