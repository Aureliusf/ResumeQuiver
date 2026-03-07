import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  release: import.meta.env.VITE_APP_VERSION,

  sendDefaultPii: false,

  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  tracesSampleRate: 0.1,
  tracePropagationTargets: ['localhost'],

  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,

  beforeSend(event) {
    if (event.exception?.values) {
      event.exception.values.forEach((exception) => {
        if (exception.stacktrace?.frames) {
          exception.stacktrace.frames.forEach((frame) => {
            delete frame.vars;
          });
        }
      });
    }

    delete event.extra?.yamlText;
    delete event.extra?.resumeData;
    delete event.extra?.apiKey;
    delete event.contexts?.localStorage;

    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map((crumb) => {
        if (crumb.data) {
          delete crumb.data.input;
          delete crumb.data.response;
        }
        return crumb;
      });
    }

    return event;
  },

  ignoreErrors: [
    /YAMLException/,
    /Failed to fetch/,
    /NetworkError/,
    /AbortError/,
  ],
});
