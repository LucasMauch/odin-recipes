// Almacén local: registro de repasos (fuente de verdad) + pruebas + ajustes.
// Exportable/importable y fusionable por id de evento (base para sincronizar).
import { repasar, reconstruir } from './planificador.js';

const CLAVE = 'mia-vojo-v1';

export function claveDia(fecha = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${fecha.getFullYear()}-${p(fecha.getMonth() + 1)}-${p(fecha.getDate())}`;
}

export function idEvento() {
  const b = new Uint8Array(8);
  (globalThis.crypto ?? { getRandomValues: (a) => a.map(() => Math.random() * 256) }).getRandomValues(b);
  return Date.now().toString(36) + [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

function vacio() {
  return { version: 1, log: [], pruebas: [], habla: [], ajustes: { codigo: null, sincronizado: 0, pasos: {} } };
}

export function crearAlmacen(storage) {
  let datos = vacio();
  try {
    const crudo = storage?.getItem(CLAVE);
    if (crudo) datos = { ...vacio(), ...JSON.parse(crudo) };
  } catch { /* sin almacenamiento: funciona en memoria */ }
  let tarjetas = reconstruir(datos.log);

  const guardar = () => {
    try { storage?.setItem(CLAVE, JSON.stringify(datos)); } catch { /* cuota/privado */ }
  };

  return {
    get tarjetas() { return tarjetas; },
    get log() { return datos.log; },
    get pruebas() { return datos.pruebas; },
    get ajustes() { return datos.ajustes; },

    /** Registra un repaso (tarjeta, fecha, resultado) y actualiza FSRS. */
    registrarRepaso(carta, calificacion, t = Date.now()) {
      const e = { id: idEvento(), c: carta, t, g: calificacion };
      datos.log.push(e);
      tarjetas[carta] = repasar(tarjetas[carta], calificacion, new Date(t));
      guardar();
      return e;
    },
    registrarPrueba({ lec = null, nota, n, t = Date.now() }) {
      datos.pruebas.push({ id: idEvento(), lec, nota, n, t });
      guardar();
    },
    registrarHabla({ carta, auto, t = Date.now() }) {
      datos.habla.push({ id: idEvento(), c: carta, auto, t });
      guardar();
    },
    nuevasHoy(ahora = new Date()) {
      const dia = claveDia(ahora);
      const primeras = new Map();
      for (const e of [...datos.log].sort((a, b) => a.t - b.t)) if (!primeras.has(e.c)) primeras.set(e.c, e.t);
      return [...primeras.values()].filter((t) => claveDia(new Date(t)) === dia).length;
    },
    pasosHechos(lec) { return datos.ajustes.pasos?.[lec] ?? []; },
    marcarPaso(lec, id) {
      const pasos = { ...(datos.ajustes.pasos ?? {}) };
      pasos[lec] = [...new Set([...(pasos[lec] ?? []), id])];
      datos.ajustes = { ...datos.ajustes, pasos };
      guardar();
    },
    ajustar(parcial) { datos.ajustes = { ...datos.ajustes, ...parcial }; guardar(); },

    exportar() { return JSON.stringify(datos); },
    /** Fusiona por id (idempotente). Devuelve cuántos eventos nuevos entraron. */
    importar(json) {
      const otro = typeof json === 'string' ? JSON.parse(json) : json;
      if (!otro || otro.version !== 1 || !Array.isArray(otro.log)) throw new Error('Archivo de progreso no válido');
      let nuevos = 0;
      for (const [campo] of [['log'], ['pruebas'], ['habla']]) {
        const ids = new Set(datos[campo].map((e) => e.id));
        for (const e of otro[campo] ?? []) if (!ids.has(e.id)) { datos[campo].push(e); ids.add(e.id); nuevos++; }
      }
      tarjetas = reconstruir(datos.log);
      guardar();
      return nuevos;
    },
    reiniciar() { datos = vacio(); tarjetas = {}; guardar(); },
  };
}
