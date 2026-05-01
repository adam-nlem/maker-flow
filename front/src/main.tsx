import * as Sentry from "@sentry/react";
import { HttpException } from "~/services/httpClient/HttpException";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "~/services/queryClient/queryClient";
import ToastContainer from "~/components/ui/ToastContainer";
import { Settings } from "luxon";
import { router } from "./router";
import { PostHogProvider } from '@posthog/react'
import "~/services/i18n/i18n";
import "./app.css";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  sendDefaultPii: true,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  tracesSampleRate: 0.2,
  tracePropagationTargets: ["localhost", /^https?:\/\/.*\.makerflow\./],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  beforeSend(event, hint) {
    const error = hint.originalException;

    if (error instanceof HttpException && error.response.httpStatus < 500) {
      return null;
    }

    return event;
  },
});

Settings.defaultZone = "Europe/Paris";

const postHogOptions = {
  api_host: import.meta.env.VITE_PUBLIC_POSTHOG_API_HOST,
  ui_host: import.meta.env.VITE_PUBLIC_POSTHOG_UI_HOST,
  defaults: '2026-01-30',
  person_profiles: 'always',
} as const

createRoot(document.getElementById("root")!, {
  onUncaughtError: Sentry.reactErrorHandler(),
  onCaughtError: Sentry.reactErrorHandler(),
  onRecoverableError: Sentry.reactErrorHandler(),
}).render(
  <StrictMode>
    <PostHogProvider apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN} options={postHogOptions}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <ToastContainer />
      </QueryClientProvider>
    </PostHogProvider>
  </StrictMode>,
);
