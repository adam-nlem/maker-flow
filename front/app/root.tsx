import * as Sentry from "@sentry/react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { handleMutationError } from "~/services/apiErrorHandler/apiErrorHandler";
import ToastContainer from "~/components/ui/ToastContainer";
import { Settings } from 'luxon';

import type { Route } from "./+types/root";
import "./app.css";

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: Error) => {
      handleMutationError(error)
    }
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      handleMutationError(error)
    }
  }),
});

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var d=JSON.parse(localStorage.getItem('app:theme'));if(d&&d.state&&d.state.isDark===false)return}catch(e){}document.documentElement.classList.add('dark')})()` }} />
      </head>
      <body className="h-full overflow-hidden bg-clear text-dark">
        {children}
        <ToastContainer />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  Settings.defaultZone = 'Europe/Paris'
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (error && error instanceof Error) {
    Sentry.captureException(error);
    details = import.meta.env.DEV ? error.message : details;
    stack = import.meta.env.DEV ? error.stack : undefined;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
