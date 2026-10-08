// Textos de la interfaz. Para otro idioma: crear src/i18n/<codigo>.js con las mismas claves.
import es from './i18n/es.js';

const idiomas = { es };
let actual = 'es';

export function usarIdioma(codigo) { if (idiomas[codigo]) actual = codigo; }
export function registrarIdioma(codigo, textos) { idiomas[codigo] = textos; }

/** t('clave', {n: 3}) -> texto con {n} sustituido; si falta la clave, cae en español. */
export function t(clave, vars = {}) {
  const txt = idiomas[actual][clave] ?? idiomas.es[clave] ?? clave;
  return txt.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
}
