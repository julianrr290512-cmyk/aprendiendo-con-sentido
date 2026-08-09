import type { AreaId, Nivel } from '@/types';

const MARCAS_DIACRITICAS = new RegExp('[' + String.fromCharCode(0x300) + '-' + String.fromCharCode(0x36f) + ']', 'g');

/** Normaliza texto libre a un slug ascii en minusculas (sin tildes/enye/simbolos). */
export function slugify(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(MARCAS_DIACRITICAS, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

interface ConstruirTemaIdParams {
  areaId: AreaId;
  grado: number;
  temaNombre: string;
}

/**
 * ID determinista para un tema (curado o escrito libremente): el mismo
 * nombre normalizado siempre produce el mismo id, lo que reusa cache y
 * fallback local sin necesitar un catalogo pre-registrado.
 */
export function construirTemaId({ areaId, grado, temaNombre }: ConstruirTemaIdParams): string {
  return `${areaId}-${grado}-${slugify(temaNombre) || 'tema'}`;
}

export function construirNivelId(temaId: string, dificultad: Nivel['dificultad']): string {
  return `${temaId}--${dificultad}`;
}
