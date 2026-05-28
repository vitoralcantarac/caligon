import posthog from "posthog-js";

let ready = false;

export function initAnalytics() {
  const key = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
  if (!key) return;

  posthog.init(key, {
    api_host: (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ?? "https://us.i.posthog.com",
    autocapture: false,
    capture_pageview: true,
    persistence: "localStorage",
    loaded: (ph) => {
      // Desativa captura em desenvolvimento local
      if (import.meta.env.DEV) ph.opt_out_capturing();
    },
  });

  ready = true;
}

export function identifyUser(userId: string, props?: Record<string, unknown>) {
  if (!ready) return;
  posthog.identify(userId, props);
}

export function track(event: string, props?: Record<string, unknown>) {
  if (!ready) return;
  posthog.capture(event, props);
}

export function resetAnalyticsUser() {
  if (!ready) return;
  posthog.reset();
}
