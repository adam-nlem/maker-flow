import { createBrowserRouter } from "react-router-dom";
import {
  prelaunchPath,
  verifyOtpPath,
  onboardingPath,
  loginPath,
  registerPath,
  integrationCallbackPath,
  tasksPath,
  contentsPath,
  scriptsPath,
  calendarPath,
  settingsPath,
} from "./routes/routePaths";
import ErrorBoundary from "./components/ErrorBoundary";
import PrelaunchPage from "./routes/prelaunch";
import VerifyOtpPage from "./routes/verify-otp";
import PrelaunchGuardLayout from "./routes/prelaunch-guard";
import OnboardingPage from "./routes/onboarding";
import LoginPage from "./routes/login";
import RegisterPage from "./routes/register";
import IntegrationsCallback from "./routes/integrations.callback";
import ProtectedLayout from "./routes/protected";
import SidebarLayout from "./components/sidebar/SidebarLayout";
import HomePage from "./routes/home";
import TasksPage from "./routes/tasks";
import ContentsPage from "./routes/contents";
import ScriptsPage from "./routes/scripts";
import CalendarPage from "./routes/calendar";
import SettingsLayout from "./routes/settings";
import SettingsIndex from "./routes/settings.index";
import SettingsSectionRoute from "./routes/settings.section";

export const router = createBrowserRouter(
  [
    // Prelaunch routes (outside guard)
    { path: prelaunchPath, element: <PrelaunchPage /> },
    { path: verifyOtpPath, element: <VerifyOtpPage /> },

    // All other routes (gated during prelaunch)
    {
      element: <PrelaunchGuardLayout />,
      children: [
        // Public routes
        { path: onboardingPath, element: <OnboardingPage /> },
        { path: loginPath, element: <LoginPage /> },
        { path: registerPath, element: <RegisterPage /> },
        { path: integrationCallbackPath, element: <IntegrationsCallback /> },

        // Protected routes
        {
          element: <ProtectedLayout />,
          errorElement: <ErrorBoundary />,
          children: [
            {
              element: <SidebarLayout />,
              children: [
                { index: true, element: <HomePage /> },
                { path: tasksPath, element: <TasksPage /> },
                { path: contentsPath, element: <ContentsPage /> },
                { path: scriptsPath, element: <ScriptsPage /> },
                { path: calendarPath, element: <CalendarPage /> },
                {
                  path: settingsPath,
                  element: <SettingsLayout />,
                  children: [
                    { index: true, element: <SettingsIndex /> },
                    { path: ":section", element: <SettingsSectionRoute /> },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
);
