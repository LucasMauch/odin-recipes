import test from 'node:test';
import assert from 'node:assert/strict';
import { armarSesion, armarPrueba, evaluarCarta, notaPrueba, intercalar, NUEVAS_POR_DIA } from '../src/sesion.js';
import { repasar } from '../src/planificador.js';

const mk = (lec, tipo, n) => ({ id: `L${lec}-${tipo}-${n}`, lec, tipo, es: 'x', eo: 'ĉambro', aceptadas: [] });
const cartas = [mk(1, 'cloze', 1), mk(1, 'palabra', 1), mk(1, 'frase', 1), mk(1, 'palabra', 2), mk(1, 'pregunta', 1), mk(2, 'palabra', 3)];
const T0 = new Date('2026-01-01T10:00:00Z');

test('nuevas: máximo 4/día, alternando tipos', () => {
  const s = armarSesion({ cartas, estados: {}, leccion: 1, ahora: T0 });
  assert.equal(s.nuevas.length, NUEVAS_POR_DIA);
  assert.deepEqual(s.nuevas.map((c) => c.tipo), ['palabra', 'frase', 'cloze', 'pregunta']);
  assert.equal(armarSesion({ cartas, estados: {}, leccion: 1, nuevasHoy: 4 }).nuevas.length, 0);
});
test('repaso: solo vencidas; intercala lecciones', () => {
  const estados = {};
  for (const c of cartas) estados[c.id] = repasar(undefined, 3, T0);
  const despues = new Date(T0.getTime() + 30 * 86400000);
  const s = armarSesion({ cartas, estados, leccion: 1, ahora: despues });
  assert.equal(s.repaso.length, cartas.length);
  assert.equal(new Set(s.repaso.slice(0, 2).map((c) => c.lec)).size, 2);
  assert.equal(armarSesion({ cartas, estados, leccion: 1, ahora: T0 }).repaso.length, 0);
});
test('dictado: solo existe con voz y para frases ya vistas', () => {
  const estados = { [cartas[2].id]: repasar(undefined, 3, T0) };
  const later = new Date(T0.getTime() + 30 * 86400000);
  assert.equal(armarSesion({ cartas, estados, leccion: 1, ahora: later, conVoz: false }).repaso.some((c) => c.tipo === 'dictado'), false);
  assert.equal(armarSesion({ cartas, estados, leccion: 1, ahora: later, conVoz: true }).repaso.some((c) => c.tipo === 'dictado'), false); // gemela es nueva
});
test('prueba: n tarjetas de lo visto o de la lección', () => {
  const estados = { [cartas[0].id]: {}, [cartas[1].id]: {} };
  assert.equal(armarPrueba({ cartas, estados, n: 8 }).length, 2);
  assert.equal(armarPrueba({ cartas, estados: {}, leccion: 1, n: 8 }).length, 5);
});
test('evaluarCarta: cloze exige todos los huecos', () => {
  const c = { tipo: 'cloze', huecos: ['la', 'ĉambro'], eo: '' };
  assert.equal(evaluarCarta(c, ['la', 'cxambro']), 'ok');
  assert.equal(evaluarCarta(c, ['la', 'cambro']), 'casi');
  assert.equal(evaluarCarta(c, ['la', 'tablo']), 'mal');
});
test('evaluarCarta: acepta alternativas', () => {
  assert.equal(evaluarCarta({ tipo: 'palabra', eo: 'a', aceptadas: ['b'] }, 'B'), 'ok');
});
test('notaPrueba 0-100 con medio punto por «casi»', () => {
  assert.equal(notaPrueba(['ok', 'ok', 'ok', 'ok']), 100);
  assert.equal(notaPrueba(['ok', 'casi', 'mal', 'mal']), 38);
  assert.equal(notaPrueba([]), 0);
});
test('intercalar alterna lecciones', () => {
  assert.deepEqual(intercalar([{ lec: 1, i: 1 }, { lec: 1, i: 2 }, { lec: 2, i: 3 }]).map((c) => c.i), [1, 3, 2]);
});
