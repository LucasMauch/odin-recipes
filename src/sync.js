// Cliente de sincronización por registro de repasos. Código de acceso largo y aleatorio;
// el servidor solo guarda su hash SHA-256. Sin cuenta, sin email, sin contraseña.
import { API_URL } from './config.js';

const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Crockford-like, sin 0/O/1/I

export function generarCodigo(largo = 26) {
  const b = new Uint8Array(largo);
  crypto.getRandomValues(b);
  const c = [...b].map((x) => ALFABETO[x % 32]).join('');
  return c.match(/.{1,5}/g).join('-'); // ~130 bits
}

export const normalizarCodigo = (c) => c.toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/(.{5})(?=.)/g, '$1-');

export const disponible = () => !!API_URL;

async function llamar(ruta, cuerpo) {
  const r = await fetch(`${API_URL}${ruta}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(cuerpo) });
  if (!r.ok) throw new Error(`sync ${r.status}`);
  return r.json();
}

export async function sincronizar(almacen, codigo) {
  const desde = almacen.ajustes.sincronizado ?? 0;
  const enviado = almacen.ajustes.enviadoHasta ?? 0;
  const log = almacen.log.filter((e) => e.t > enviado).slice(0, 500);
  const pruebas = almacen.pruebas.filter((e) => e.t > enviado).slice(0, 500);
  const resp = await llamar('/api/sync', { codigo, desde, log, pruebas });
  const maxT = Math.max(enviado, ...log.map((e) => e.t), ...pruebas.map((e) => e.t));
  almacen.ajustar({ enviadoHasta: log.length >= 500 || pruebas.length >= 500 ? Math.max(enviado, Math.min(...[log, pruebas].filter((l) => l.length >= 500).map((l) => l[l.length - 1].t))) : maxT });
  const nuevos = almacen.importar({ version: 1, log: resp.log ?? [], pruebas: resp.pruebas ?? [], habla: [] });
  almacen.ajustar({ sincronizado: resp.cursor ?? desde });
  return nuevos;
}
