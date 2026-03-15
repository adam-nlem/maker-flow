import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";
import {
  prelaunchPath,
  onboardingPath,
  loginPath,
  registerPath,
  verifyOtpPath,
  integrationCallbackPath,
  tasksPath,
  insightsPath,
  scriptsPath,
  calendarPath,
  settingsPath,
} from "./routes/routePaths";

// We need to remove the / befor the paths
const p = (path: string) => path.slice(1);

export default [
  // Prelaunch routes (outside guard)
  route(p(prelaunchPath), "routes/prelaunch.tsx"),
  route(p(verifyOtpPath), "routes/verify-otp.tsx"),

  // All other routes (gated during prelaunch)
  layout("routes/prelaunch-guard.tsx", [
    // Public routes
    route(p(onboardingPath), "routes/onboarding.tsx"),
    route(p(loginPath), "routes/login.tsx"),
    route(p(registerPath), "routes/register.tsx"),
    route(p(integrationCallbackPath), "routes/integrations.callback.tsx"),

    // Protected routes
    layout("routes/protected.tsx", [
      index("routes/home.tsx"),
      route(p(tasksPath), "routes/tasks.tsx"),
      route(p(insightsPath), "routes/insights.tsx"),
      route("insights/posts/:postUuid", "routes/insights.post-detail.tsx"),
      route(p(scriptsPath), "routes/scripts.tsx"),
      route(p(calendarPath), "routes/calendar.tsx"),
      route(p(settingsPath), "routes/settings.tsx", [
        index("routes/settings.index.tsx"),
        route(":section", "routes/settings.section.tsx"),
      ]),
    ]),
  ]),
] satisfies RouteConfig;
