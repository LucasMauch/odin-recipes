import test from 'node:test';
import assert from 'node:assert/strict';
import { dominioLeccion, leccionActual, recordada } from '../src/dominio.js';
import { State } from '../src/planificador.js';

const cartas = Array.from({ length: 10 }, (_, i) => ({ id: `c${i}`, lec: 1 })).concat([{ id: 'd0', lec: 2 }]);
const rev = (s) => ({ state: State.Review, stability: s });

test('recordada exige estado Review y estabilidad ≥ 3 días', () => {
  assert.equal(recordada(rev(3)), true);
  assert.equal(recordada(rev(2.9)), false);
  assert.equal(recordada({ state: State.Learning, stability: 10 }), false);
  assert.equal(recordada(undefined), false);
});
test('dominada requiere 80 % recordado Y nota ≥ 90', () => {
  const est = Object.fromEntries(Array.from({ length: 8 }, (_, i) => [`c${i}`, rev(5)]));
  assert.equal(dominioLeccion(cartas, est, [], 1).dominada, false);                       // sin prueba
  assert.equal(dominioLeccion(cartas, est, [{ lec: 1, nota: 89, t: 1 }], 1).dominada, false);
  assert.equal(dominioLeccion(cartas, est, [{ lec: 1, nota: 90, t: 1 }], 1).dominada, true);
  const poco = { ...est }; delete poco.c0;                                                  // 70 %
  assert.equal(dominioLeccion(cartas, poco, [{ lec: 1, nota: 100, t: 1 }], 1).dominada, false);
});
test('usa la ÚLTIMA prueba, no la mejor', () => {
  const est = Object.fromEntries(cartas.filter((c) => c.lec === 1).map((c) => [c.id, rev(9)]));
  const pruebas = [{ lec: 1, nota: 100, t: 1 }, { lec: 1, nota: 60, t: 2 }];
  assert.equal(dominioLeccion(cartas, est, pruebas, 1).nota, 60);
  assert.equal(dominioLeccion(cartas, est, pruebas, 1).dominada, false);
});
test('leccionActual es la primera no dominada', () => {
  assert.equal(leccionActual(cartas, {}, [], [1, 2]), 1);
  const est = Object.fromEntries(cartas.filter((c) => c.lec === 1).map((c) => [c.id, rev(9)]));
  assert.equal(leccionActual(cartas, est, [{ lec: 1, nota: 95, t: 1 }], [1, 2]), 2);
});
