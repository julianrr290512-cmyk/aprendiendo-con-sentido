export type AreaIconName = 'sigma' | 'triangle' | 'bar-chart' | 'function-square' | 'infinity';

/** Simbolo unicode representativo de cada area, usado en la explosion de particulas al hover. */
export const AREA_SIMBOLO: Record<AreaIconName, string> = {
  sigma: '∑',
  triangle: '△',
  'bar-chart': '▦',
  'function-square': 'f(x)',
  infinity: '∞',
};
