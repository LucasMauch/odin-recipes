import test from 'node:test';
import assert from 'node:assert/strict';
import { manejar, hashCodigo } from '../worker/index.js';

// D1 simulada mínima en memoria (solo las sentencias que usa el Worker).
function d1falsa() {
  const usuarios = new Set(); const eventos = []; let seq = 0;
  const prep = (sql) => ({
    sql, args: [],
    bind(...a) { return { ...this, args: a }; },
    async all() {
      const [u, desde] = this.args;
      return { results: eventos.filter((e) => e.usuario === u && e.seq > desde).map(({ seq, tipo, datos }) => ({ seq, tipo, datos })) };
    },
  });
  return {
    eventos, usuarios,
    prepare: prep,
    async batch(ss) {
      for (const s of ss) {
        if (s.sql.includes('INTO usuarios')) usuarios.add(s.args[0]);
        else { const [usuario, id, tipo, datos] = s.args; if (!eventos.some((e) => e.usuario === usuario && e.id === id)) eventos.push({ seq: ++seq, usuario, id, tipo, datos }); }
      }
    },
  };
}
const COD = 'ABCDE-FGHJK-LMNPQ-RSTUV-WXYZ2';
const peticion = (cuerpo, metodo = 'POST', ruta = '/api/sync') => new Request(`https://x.test${ruta}`, { method: metodo, body: metodo === 'POST' ? JSON.stringify(cuerpo) : undefined });

test('guarda solo el hash del código', async () => {
  const env = { DB: d1falsa() };
  await manejar(peticion({ codigo: COD, log: [], pruebas: [] }), env);
  assert.deepEqual([...env.DB.usuarios], [await hashCodigo(COD)]);
  assert.ok(![...env.DB.usuarios].some((u) => u.includes('ABCDE')));
});
test('sincroniza entre dos dispositivos e ignora duplicados', async () => {
  const env = { DB: d1falsa() };
  const A = { id: 'a1', c: 'L01-x', t: 1, g: 3 };
  let r = await (await manejar(peticion({ codigo: COD, log: [A], pruebas: [{ id: 'p1', lec: 1, nota: 90, n: 8, t: 2 }] }), env)).json();
  assert.equal(r.log.length, 1); assert.equal(r.pruebas.length, 1);
  r = await (await manejar(peticion({ codigo: COD, log: [A, { id: 'a2', c: 'L01-y', t: 3, g: 1 }], desde: 0 }), env)).json();
  assert.equal(r.log.length, 2);
  assert.equal(env.DB.eventos.length, 3);
  const r2 = await (await manejar(peticion({ codigo: COD, desde: r.cursor }), env)).json();
  assert.equal(r2.log.length, 0);
});
test('los datos de un código no se ven con otro', async () => {
  const env = { DB: d1falsa() };
  await manejar(peticion({ codigo: COD, log: [{ id: 'a1', c: 'x', t: 1, g: 3 }] }), env);
  const r = await (await manejar(peticion({ codigo: 'ZZZZZ-ZZZZZ-ZZZZZ-ZZZZZ-ZZZZZ' }), env)).json();
  assert.equal(r.log.length, 0);
});
test('rechaza código corto, eventos inválidos, ruta/método incorrectos', async () => {
  const env = { DB: d1falsa() };
  assert.equal((await manejar(peticion({ codigo: 'abc' }), env)).status, 400);
  assert.equal((await manejar(peticion({ codigo: COD, log: [{ id: 'a', c: 'x', t: 1, g: 9 }] }), env)).status, 400);
  assert.equal((await manejar(peticion({}, 'GET'), env)).status, 404);
  assert.equal((await manejar(peticion({}, 'POST', '/otra'), env)).status, 404);
  assert.equal((await manejar(peticion({ codigo: COD, log: Array.from({ length: 501 }, (_, i) => ({ id: `i${i}`, c: 'x', t: 1, g: 3 })) }), env)).status, 413);
});
