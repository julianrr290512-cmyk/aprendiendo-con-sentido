import type { AnalyticsEvent } from '@/types';

const ENABLED = import.meta.env.VITE_ANALYTICS_ENABLED === 'true';
const ENDPOINT = import.meta.env.VITE_ANALYTICS_ENDPOINT;

export function trackEvent(
  nombre: string,
  propiedades?: AnalyticsEvent['propiedades'],
): void {
  const evento: AnalyticsEvent = {
    nombre,
    propiedades,
    timestamp: new Date().toISOString(),
  };

  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.info('[analytics]', evento);
  }

  if (!ENABLED || !ENDPOINT) return;

  navigator.sendBeacon?.(ENDPOINT, JSON.stringify(evento));
}
