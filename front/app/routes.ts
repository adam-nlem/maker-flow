import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  // Public routes
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),

  // Protected routes
  layout("routes/protected.tsx", [
    index("routes/home.tsx"),
    route("library", "routes/library.tsx"),
  ]),
] satisfies RouteConfig;
