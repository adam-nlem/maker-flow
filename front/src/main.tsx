import * as Sentry from "@sentry/react";
import { CustomHttpException } from "~/services/httpClient/customHttpExceptions";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "~/services/queryClient/queryClient";
import ToastContainer from "~/components/ui/ToastContainer";
import { Settings } from "luxon";
import { router } from "./router";
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

    if (error instanceof CustomHttpException && error.statusCode < 500) {
      return null;
    }

    return event;
  },
});

Settings.defaultZone = "Europe/Paris";

createRoot(document.getElementById("root")!, {
  onUncaughtError: Sentry.reactErrorHandler(),
  onCaughtError: Sentry.reactErrorHandler(),
  onRecoverableError: Sentry.reactErrorHandler(),
}).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ToastContainer />
    </QueryClientProvider>
  </StrictMode>,
);
