import { createBrowserRouter } from "react-router-dom";
import {
  prelaunchPath,
  privacyPolicyPath,
  termsOfServicePath,
  verifyOtpPath,
  onboardingPath,
  loginPath,
  registerPath,
  integrationCallbackPath,
  agencyHomePath,
  agencyTasksPath,
  agencyReviewsPath,
  agencyContentsPath,
  agencyScriptsPath,
  agencyCalendarPath,
  agencySettingsPath,
  clientHomePath,
  clientReviewsPath,
  clientContentsPath,
  clientSettingsPath,
  inviteRouteMatcher,
} from "./routes/routePaths";
import ErrorBoundary from "./components/ErrorBoundary";
import PrelaunchPage from "./routes/prelaunch";
import PrivacyPolicyPage from "./routes/privacy-policy";
import TermsOfServicePage from "./routes/terms-of-service";
import VerifyOtpPage from "./routes/verify-otp";
import PrelaunchGuardLayout from "./routes/prelaunch-guard";
import OnboardingPage from "./routes/onboarding";
import LoginPage from "./routes/login";
import RegisterPage from "./routes/register";
import IntegrationsCallback from "./routes/integrations.callback";
import InviteTokenPage from "./routes/invite.token";
import ProtectedLayout from "./routes/protected";
import RootRedirect from "./components/auth/RootRedirect";
import AgencyShellLayout from "./components/agency/AgencyShellLayout";
import ClientShellLayout from "./components/client/ClientShellLayout";
import AgencyHomePage from "./routes/agency/home";
import AgencyTasksPage from "./routes/agency/tasks";
import AgencyContentsPage from "./routes/agency/contents";
import AgencyReviewsPage from "./routes/agency/reviews";
import AgencyScriptsPage from "./routes/agency/scripts";
import AgencyCalendarPage from "./routes/agency/calendar";
import AgencySettingsLayout from "./routes/agency/settings";
import AgencySettingsIndex from "./routes/agency/settings.index";
import AgencySettingsSectionRoute from "./routes/agency/settings.section";
import ClientHomePage from "./routes/client/home";
import ClientReviewsPage from "./routes/client/reviews";
import ClientContentsPage from "./routes/client/contents";
import ClientSettingsLayout from "./routes/client/settings";
import ClientSettingsIndex from "./routes/client/settings.index";
import ClientSettingsSectionRoute from "./routes/client/settings.section";

export const router = createBrowserRouter(
  [
    // Prelaunch routes (outside guard)
    { path: prelaunchPath, element: <PrelaunchPage /> },
    { path: verifyOtpPath, element: <VerifyOtpPage /> },
    { path: privacyPolicyPath, element: <PrivacyPolicyPage /> },
    { path: termsOfServicePath, element: <TermsOfServicePage /> },

    // All other routes (gated during prelaunch)
    {
      element: <PrelaunchGuardLayout />,
      children: [
        // Public root: redirects to /login for visitors, dispatches authenticated users by role
        { index: true, element: <RootRedirect /> },

        // Public routes
        { path: onboardingPath, element: <OnboardingPage /> },
        { path: loginPath, element: <LoginPage /> },
        { path: registerPath, element: <RegisterPage /> },
        { path: integrationCallbackPath, element: <IntegrationsCallback /> },
        { path: inviteRouteMatcher, element: <InviteTokenPage /> },

        // Protected routes (auth + onboarding)
        {
          element: <ProtectedLayout />,
          errorElement: <ErrorBoundary />,
          children: [
            // Agency shell — asserts non-client role internally
            {
              element: <AgencyShellLayout />,
              children: [
                { path: agencyHomePath, element: <AgencyHomePage /> },
                { path: agencyTasksPath, element: <AgencyTasksPage /> },
                { path: agencyContentsPath, element: <AgencyContentsPage /> },
                { path: agencyReviewsPath, element: <AgencyReviewsPage /> },
                { path: agencyScriptsPath, element: <AgencyScriptsPage /> },
                { path: agencyCalendarPath, element: <AgencyCalendarPage /> },
                {
                  path: agencySettingsPath,
                  element: <AgencySettingsLayout />,
                  children: [
                    { index: true, element: <AgencySettingsIndex /> },
                    { path: ":section", element: <AgencySettingsSectionRoute /> },
                  ],
                },
              ],
            },

            // Client shell — asserts client role internally
            {
              element: <ClientShellLayout />,
              children: [
                { path: clientHomePath, element: <ClientHomePage /> },
                { path: clientReviewsPath, element: <ClientReviewsPage /> },
                { path: clientContentsPath, element: <ClientContentsPage /> },
                {
                  path: clientSettingsPath,
                  element: <ClientSettingsLayout />,
                  children: [
                    { index: true, element: <ClientSettingsIndex /> },
                    { path: ":section", element: <ClientSettingsSectionRoute /> },
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
