// Normalización de respuestas: sistema x, mayúsculas, puntuación, espacios.

const X = { c: 'ĉ', g: 'ĝ', h: 'ĥ', j: 'ĵ', s: 'ŝ', u: 'ŭ' };

/** Convierte cx, gx, hx, jx, sx, ux (y Cx, CX…) en ĉ ĝ ĥ ĵ ŝ ŭ. */
export function aplicarSistemaX(texto) {
  return texto.replace(/([cghjsuCGHJSU])[xX]/g, (_, l) => {
    const r = X[l.toLowerCase()];
    return l === l.toLowerCase() ? r : r.toUpperCase();
  });
}

/** Forma canónica para comparar (conserva los diacríticos del esperanto). */
export function normalizar(texto) {
  return aplicarSistemaX(String(texto ?? '').normalize('NFC'))
    .toLowerCase()
    .replace(/[¿?¡!.,;:"“”«»()…–—]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Quita diacríticos del esperanto (solo para detectar «casi»). */
export function sinDiacriticos(texto) {
  return texto.replace(/ĉ/g, 'c').replace(/ĝ/g, 'g').replace(/ĥ/g, 'h')
    .replace(/ĵ/g, 'j').replace(/ŝ/g, 's').replace(/ŭ/g, 'u');
}

export function distancia(a, b) {
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
}

/**
 * Evalúa una respuesta contra una o varias respuestas válidas.
 * @returns {'ok'|'casi'|'mal'}  «casi» = falta un diacrítico o hay 1 typo en texto largo.
 */
export function evaluar(respuesta, validas) {
  const r = normalizar(respuesta);
  if (!r) return 'mal';
  const lista = (Array.isArray(validas) ? validas : [validas]).map(normalizar);
  if (lista.includes(r)) return 'ok';
  for (const v of lista) {
    if (sinDiacriticos(r) === sinDiacriticos(v)) return 'casi';
    if (v.length >= 8 && distancia(r, v) === 1) return 'casi';
  }
  return 'mal';
}
