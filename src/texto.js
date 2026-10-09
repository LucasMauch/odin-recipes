// Clasificación de morfemas del esperanto para colorear el texto del curso (no modifica el texto).
const SUST = new Set(['o']);
const ADJ = new Set(['a']);
const ADV = new Set(['e']);
const VERBO = new Set(['as', 'is', 'os', 'us', 'u', 'i']);
const CASO = new Set(['j', 'n']);

/** 'sust' | 'adj' | 'adv' | 'verbo' | 'caso' | 'raiz' */
export function claseMorfema(m, esUltimoOPenultimo = true) {
  if (!esUltimoOPenultimo) return 'raiz';
  if (SUST.has(m)) return 'sust';
  if (ADJ.has(m)) return 'adj';
  if (ADV.has(m)) return 'adv';
  if (VERBO.has(m)) return 'verbo';
  if (CASO.has(m)) return 'caso';
  return 'raiz';
}

export const ETIQUETA_CLASE = { sust: 'sustantivo', adj: 'adjetivo', adv: 'adverbio', verbo: 'verbo', caso: 'plural/acusativo', raiz: 'raíz' };

/** Una «palabra» de texto: lista de morfemas -> {texto, partes:[{m, clase, glosa}]}. */
export function describirPalabra(morfemas, glosas) {
  const partes = morfemas.map((m, i) => {
    const finales = i >= morfemas.length - 2 && morfemas.length > 1;
    const clase = claseMorfema(m, finales || morfemas.length === 1 ? m === m.toLowerCase() : false);
    const g = glosas[m] ?? glosas[m.toLowerCase()] ?? [];
    return { m, clase, glosa: g.join(' / ') };
  });
  return { texto: morfemas.join(''), partes };
}
