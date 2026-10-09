// Lógica pura de la sesión diaria (sin DOM): repaso → nuevo → hablar → prueba.
import { evaluar } from './normalizar.js';
import { estaVencida } from './planificador.js';

export const NUEVAS_POR_DIA = 4;
export const MAX_REPASOS = 20;
export const PREGUNTAS_PRUEBA = 8;

const PRIORIDAD = { palabra: 0, frase: 1, cloze: 2, pregunta: 3, dictado: 4 };

/** Mezcla determinista opcional (Fisher-Yates) con rng inyectable. */
export function mezclar(lista, rng = Math.random) {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Reparte por lección en round-robin para intercalar temas. */
export function intercalar(cartas) {
  const grupos = new Map();
  for (const c of cartas) {
    if (!grupos.has(c.lec)) grupos.set(c.lec, []);
    grupos.get(c.lec).push(c);
  }
  const colas = [...grupos.values()];
  const out = [];
  while (colas.some((q) => q.length)) for (const q of colas) if (q.length) out.push(q.shift());
  return out;
}

/** Tarjetas gemelas de dictado (solo si hay voz y la frase ya fue vista). */
export function conDictados(cartas, estados, conVoz) {
  if (!conVoz) return cartas;
  const gemelas = cartas
    .filter((c) => c.tipo === 'frase' && estados[c.id])
    .map((c) => ({ ...c, id: `${c.id}~dict`, tipo: 'dictado', aceptadas: c.aceptadas ?? [] }));
  return [...cartas, ...gemelas];
}

/** Alterna tipos (palabra, frase, cloze, pregunta) dentro de la lección más temprana, para que el primer día ya haya frases que decir. */
function mezclarTipos(cartas) {
  if (!cartas.length) return [];
  const lec = cartas[0].lec;
  const grupos = Object.keys(PRIORIDAD).map((tipo) => cartas.filter((c) => c.lec === lec && c.tipo === tipo)).filter((g) => g.length);
  const out = [];
  while (grupos.some((g) => g.length)) for (const g of grupos) if (g.length) out.push(g.shift());
  return out.concat(cartas.filter((c) => c.lec !== lec));
}

export function armarSesion({ cartas, estados, ahora = new Date(), leccion, nuevasHoy = 0, conVoz = false, habilitadas = null, rng = Math.random }) {
  const pool = conDictados(cartas, estados, conVoz);
  const vencidas = pool
    .filter((c) => estaVencida(estados[c.id], ahora))
    .sort((a, b) => new Date(estados[a.id].due) - new Date(estados[b.id].due));
  const repaso = intercalar(vencidas).slice(0, MAX_REPASOS);

  const cupo = Math.max(0, NUEVAS_POR_DIA - nuevasHoy);
  const sinVer = cartas.filter((c) => c.lec >= leccion && !estados[c.id] && (!habilitadas || habilitadas.has(c.lec))).sort((a, b) => a.lec - b.lec);
  const nuevas = mezclarTipos(sinVer).slice(0, cupo);

  const frases = pool.filter((c) => ['frase', 'pregunta'].includes(c.tipo) && (estados[c.id] || nuevas.includes(c)));
  const hablar = mezclar(frases.filter((c) => c.tipo !== 'dictado'), rng).slice(0, 3);
  return { repaso, nuevas, hablar };
}

/** Prueba sin ayudas: n tarjetas de lo ya visto (o de una lección concreta). */
export function armarPrueba({ cartas, estados, leccion = null, n = PREGUNTAS_PRUEBA, rng = Math.random }) {
  const base = cartas.filter((c) => (leccion ? c.lec === leccion : !!estados[c.id]));
  return mezclar(base, rng).slice(0, n);
}

/** Evalúa una tarjeta. `respuesta`: string, o array de strings para cloze. */
export function evaluarCarta(carta, respuesta) {
  if (carta.tipo === 'cloze') {
    const rs = Array.isArray(respuesta) ? respuesta : [respuesta];
    const res = carta.huecos.map((h, i) => evaluar(rs[i] ?? '', h));
    if (res.every((x) => x === 'ok')) return 'ok';
    if (res.some((x) => x === 'mal')) return 'mal';
    return 'casi';
  }
  return evaluar(respuesta, [carta.eo, ...(carta.aceptadas ?? [])]);
}

export const aCalificacion = { ok: 3, casi: 2, mal: 1 }; // Good / Hard / Again

export function notaPrueba(resultados) {
  if (!resultados.length) return 0;
  const pts = resultados.reduce((s, r) => s + (r === 'ok' ? 1 : r === 'casi' ? 0.5 : 0), 0);
  return Math.round((100 * pts) / resultados.length);
}
