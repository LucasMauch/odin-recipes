import test from 'node:test';
import assert from 'node:assert/strict';
import { crearAlmacen, claveDia } from '../src/almacen.js';
import { mdAHtml } from '../src/md.js';

const memoria = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v) }; };

test('persiste y recupera el registro de repasos', () => {
  const s = memoria();
  const a = crearAlmacen(s);
  a.registrarRepaso('L01-x', 3, Date.UTC(2026, 0, 1));
  const b = crearAlmacen(s);
  assert.equal(b.log.length, 1);
  assert.deepEqual(b.tarjetas['L01-x'], a.tarjetas['L01-x']);
});
test('importar fusiona por id y es idempotente', () => {
  const a = crearAlmacen(memoria()), b = crearAlmacen(memoria());
  a.registrarRepaso('c1', 3, 1000); b.registrarRepaso('c2', 1, 2000);
  assert.equal(a.importar(b.exportar()), 1);
  assert.equal(a.importar(b.exportar()), 0);
  assert.deepEqual(Object.keys(a.tarjetas).sort(), ['c1', 'c2']);
});
test('importar rechaza archivos inválidos', () => {
  assert.throws(() => crearAlmacen(memoria()).importar('{"x":1}'));
});
test('funciona sin almacenamiento disponible', () => {
  const a = crearAlmacen(null);
  a.registrarRepaso('c', 3);
  assert.equal(a.log.length, 1);
});
test('nuevasHoy cuenta tarjetas vistas por primera vez hoy', () => {
  const a = crearAlmacen(memoria());
  const hoy = new Date(2026, 5, 10, 12);
  a.registrarRepaso('c1', 3, hoy.getTime()); a.registrarRepaso('c1', 3, hoy.getTime() + 5);
  a.registrarRepaso('c2', 3, new Date(2026, 5, 9, 12).getTime());
  assert.equal(a.nuevasHoy(hoy), 1);
  assert.equal(claveDia(hoy), '2026-06-10');
});
test('md: escapa HTML y renderiza lo básico', () => {
  const h = mdAHtml('# Título\n\n<script>x</script> **negra** y *cursiva*\n\n- uno\n- dos\n\n1. a');
  assert.ok(!h.includes('<script>'));
  assert.ok(h.includes('<h2>Título</h2>') && h.includes('<strong>negra</strong>') && h.includes('<em>cursiva</em>'));
  assert.ok(h.includes('<ul>') && h.includes('<ol>'));
});
