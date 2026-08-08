import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals';
import type { WebVitalMetric } from '@/types';

function rate(metric: Metric): WebVitalMetric['rating'] {
  return metric.rating;
}

function toWebVitalMetric(metric: Metric): WebVitalMetric {
  return {
    name: metric.name as WebVitalMetric['name'],
    value: metric.value,
    rating: rate(metric),
    id: metric.id,
  };
}

export function reportWebVitals(onMetric?: (metric: WebVitalMetric) => void): void {
  const shouldReport = import.meta.env.VITE_REPORT_WEB_VITALS === 'true';
  if (!shouldReport) return;

  const handle = (metric: Metric) => {
    const parsed = toWebVitalMetric(metric);
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.info(`[web-vitals] ${parsed.name}: ${parsed.value.toFixed(2)} (${parsed.rating})`);
    }
    onMetric?.(parsed);
  };

  onCLS(handle);
  onINP(handle);
  onLCP(handle);
  onFCP(handle);
  onTTFB(handle);
}

export function measureRenderTime(label: string, fn: () => void): void {
  const start = performance.now();
  fn();
  const duration = performance.now() - start;
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug(`[perf] ${label}: ${duration.toFixed(2)}ms`);
  }
}
