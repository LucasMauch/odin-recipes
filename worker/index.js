// Cloudflare Worker: sincronización por registro de eventos. Sin cuentas ni emails.
// Despliegue: ver README (wrangler.toml.example). NO PROBADO contra Cloudflare real (solo con una D1 simulada en tests).

const MAX_EVENTOS = 500;
const MAX_CUERPO = 256 * 1024;
const RE_CODIGO = /^[A-Z2-9]{5}(-[A-Z2-9]{5}){3,7}$/;

export async function hashCodigo(codigo) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(codigo));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
}

const esCadena = (v, max) => typeof v === 'string' && v.length > 0 && v.length <= max;

export function validarRepaso(e) {
  return e && esCadena(e.id, 40) && esCadena(e.c, 80) && Number.isSafeInteger(e.t) && [1, 2, 3, 4].includes(e.g);
}
export function validarPrueba(e) {
  return e && esCadena(e.id, 40) && Number.isSafeInteger(e.t) && Number.isFinite(e.nota) && e.nota >= 0 && e.nota <= 100
    && (e.lec === null || Number.isInteger(e.lec));
}

function cors(env) {
  return {
    'access-control-allow-origin': env.ORIGEN_PERMITIDO || '*',
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'access-control-max-age': '86400',
  };
}
const json = (obj, status, env) => new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json', ...cors(env) } });

export async function manejar(request, env) {
  const url = new URL(request.url);
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(env) });
  if (url.pathname !== '/api/sync' || request.method !== 'POST') return json({ error: 'no encontrado' }, 404, env);

  const texto = await request.text();
  if (texto.length > MAX_CUERPO) return json({ error: 'cuerpo demasiado grande' }, 413, env);
  let b;
  try { b = JSON.parse(texto); } catch { return json({ error: 'JSON inválido' }, 400, env); }
  if (!b || typeof b.codigo !== 'string' || !RE_CODIGO.test(b.codigo)) return json({ error: 'código inválido' }, 400, env);

  const log = Array.isArray(b.log) ? b.log : [];
  const pruebas = Array.isArray(b.pruebas) ? b.pruebas : [];
  if (log.length > MAX_EVENTOS || pruebas.length > MAX_EVENTOS) return json({ error: 'demasiados eventos' }, 413, env);
  if (!log.every(validarRepaso) || !pruebas.every(validarPrueba)) return json({ error: 'evento inválido' }, 400, env);
  const desde = Number.isInteger(b.desde) && b.desde >= 0 ? b.desde : 0;

  const usuario = await hashCodigo(b.codigo);
  const db = env.DB;
  const sentencias = [db.prepare('INSERT OR IGNORE INTO usuarios (hash, creado) VALUES (?, ?)').bind(usuario, Date.now())];
  const ins = db.prepare('INSERT OR IGNORE INTO eventos (usuario, id, tipo, datos) VALUES (?, ?, ?, ?)');
  for (const e of log) sentencias.push(ins.bind(usuario, e.id, 'r', JSON.stringify({ id: e.id, c: e.c, t: e.t, g: e.g })));
  for (const e of pruebas) sentencias.push(ins.bind(usuario, e.id, 'p', JSON.stringify({ id: e.id, lec: e.lec, nota: e.nota, n: e.n ?? null, t: e.t })));
  await db.batch(sentencias);

  const { results } = await db.prepare('SELECT seq, tipo, datos FROM eventos WHERE usuario = ? AND seq > ? ORDER BY seq LIMIT 2000').bind(usuario, desde).all();
  const out = { log: [], pruebas: [], cursor: desde };
  for (const r of results) {
    (r.tipo === 'r' ? out.log : out.pruebas).push(JSON.parse(r.datos));
    out.cursor = Math.max(out.cursor, r.seq);
  }
  return json(out, 200, env);
}

export default { fetch: (request, env) => manejar(request, env) };
