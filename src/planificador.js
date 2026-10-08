// Planificador de repasos: FSRS (ts-fsrs, MIT, vendorizado en ./vendor/ts-fsrs).
import { fsrs, generatorParameters, createEmptyCard, Rating, State } from './vendor/ts-fsrs/index.mjs';

export { Rating, State };

export const RETENCION_OBJETIVO = 0.9;

const f = fsrs(generatorParameters({ request_retention: RETENCION_OBJETIVO, enable_fuzz: false }));

const aFecha = (v) => (v == null ? v : new Date(v));
const aISO = (v) => (v instanceof Date ? v.toISOString() : v);

/** Estado serializable (fechas ISO) de una tarjeta nueva. */
export function tarjetaNueva(ahora = new Date()) {
  return serializar(createEmptyCard(ahora));
}

export function serializar(c) {
  return { ...c, due: aISO(c.due), last_review: aISO(c.last_review ?? null) };
}

function deserializar(c) {
  return { ...c, due: aFecha(c.due), last_review: aFecha(c.last_review) };
}

/** Aplica una calificación (Rating.Again|Hard|Good|Easy = 1..4); devuelve el nuevo estado. */
export function repasar(estado, calificacion, ahora = new Date()) {
  const base = estado ?? tarjetaNueva(ahora);
  return serializar(f.next(deserializar(base), ahora, calificacion).card);
}

export function estaVencida(estado, ahora = new Date()) {
  return !!estado && estado.state !== State.New && new Date(estado.due) <= ahora;
}

/** Reconstruye el estado de todas las tarjetas reproduciendo el registro (orden por fecha). */
export function reconstruir(registro) {
  const orden = [...registro].sort((a, b) => a.t - b.t || (a.id < b.id ? -1 : 1));
  const tarjetas = {};
  for (const e of orden) tarjetas[e.c] = repasar(tarjetas[e.c], e.g, new Date(e.t));
  return tarjetas;
}
