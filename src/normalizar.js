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

/**
 * Marca, carácter a carácter, qué letras de la respuesta correcta NO coinciden con lo escrito
 * (subsecuencia común más larga). La puntuación nunca se marca. -> [{c, mal}]
 */
export function marcarDiferencias(correcta, respuesta) {
  const a = [...correcta];
  const b = [...aplicarSistemaX(String(respuesta ?? '').normalize('NFC')).toLowerCase()].filter((ch) => /[\p{L}\d\s-]/u.test(ch));
  const base = a.map((ch) => ch.toLowerCase());
  const n = base.length, m = b.length;
  const L = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) {
    L[i][j] = base[i] === b[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  }
  const ok = new Array(n).fill(false);
  for (let i = 0, j = 0; i < n && j < m;) {
    if (base[i] === b[j]) { ok[i] = true; i++; j++; } else if (L[i + 1][j] >= L[i][j + 1]) i++; else j++;
  }
  return a.map((c, i) => ({ c, mal: !ok[i] && /[\p{L}\d]/u.test(c) }));
}
