// Sentry integration - only loads if @sentry/react is installed and DSN is configured
// Install with: npm install @sentry/react

let Sentry: any = null

export const initSentry = async () => {
  if (!import.meta.env.VITE_SENTRY_DSN) return

  try {
    Sentry = await import('@sentry/react')
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.MODE,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
      ],
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    })
  } catch {
    // @sentry/react not installed - Sentry disabled
    console.debug('Sentry not available - install @sentry/react to enable error tracking')
  }
}

// No-op functions when Sentry is not available
export const setUser = (user: any) => {
  if (Sentry) Sentry.setUser(user)
}

export const captureException = (error: Error, context?: any) => {
  if (Sentry) Sentry.captureException(error, context)
}
