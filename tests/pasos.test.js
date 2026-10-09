import test from 'node:test';
import assert from 'node:assert/strict';
import { agruparTemas, pasosDe, lecturaCompleta, siguientePaso, minutosRestantes } from '../src/pasos.js';
import { claseMorfema, describirPalabra } from '../src/texto.js';
import { marcarDiferencias } from '../src/normalizar.js';
import { armarSesion } from '../src/sesion.js';

const lec = { gramatica: [{ titulo: 'A', md: 'x'.repeat(1800) }, { titulo: 'B', md: 'y' }] };

test('pasos: texto, un paso por tema, práctica y prueba', () => {
  const p = pasosDe(lec);
  assert.deepEqual(p.map((x) => x.id), ['texto', 't0', 't1', 'practica', 'prueba']);
  assert.ok(p[1].minutos > p[2].minutos);
});
test('lectura completa exige texto y todos los temas, no la práctica', () => {
  const p = pasosDe(lec);
  assert.equal(lecturaCompleta(p, ['texto', 't0']), false);
  assert.equal(lecturaCompleta(p, ['texto', 't0', 't1']), true);
  assert.equal(siguientePaso(p, ['texto'])?.id, 't0');
  assert.equal(siguientePaso(p, p.map((x) => x.id)), null);
  assert.equal(minutosRestantes(p, p.map((x) => x.id)), 0);
});
test('claseMorfema y describirPalabra usan glosas del curso', () => {
  assert.equal(claseMorfema('o'), 'sust');
  assert.equal(claseMorfema('as'), 'verbo');
  const d = describirPalabra(['lern', 'o', 'libr', 'o', 'j'], { lern: ['aprender'], o: ['Sustantivo'], j: ['plural'] });
  assert.equal(d.texto, 'lernolibroj');
  assert.equal(d.partes[0].glosa, 'aprender');
  assert.equal(d.partes[4].clase, 'caso');
});
test('marcarDiferencias señala solo las letras que faltan o sobran', () => {
  const r = marcarDiferencias('Ĉu vi laboras?', 'cu vi labras');
  assert.equal(r.filter((x) => x.mal).map((x) => x.c).join(''), 'Ĉo'.slice(0, 1) + 'o');
  assert.ok(marcarDiferencias('libro', 'libro').every((x) => !x.mal));
  assert.ok(!marcarDiferencias('libro?', 'libro').find((x) => x.c === '?').mal);
});
test('nuevas solo de lecciones habilitadas (lectura hecha)', () => {
  const cartas = [{ id: 'a', lec: 1, tipo: 'palabra' }, { id: 'b', lec: 2, tipo: 'palabra' }];
  assert.equal(armarSesion({ cartas, estados: {}, leccion: 1, habilitadas: new Set() }).nuevas.length, 0);
  assert.deepEqual(armarSesion({ cartas, estados: {}, leccion: 1, habilitadas: new Set([2]) }).nuevas.map((c) => c.id), ['b']);
});
test('temas cortos se agrupan (máx. 3) y los largos van solos', () => {
  const g = (n) => ({ titulo: `T${n}`, md: 'x'.repeat(n) });
  const grupos = agruparTemas([g(100), g(100), g(100), g(100), g(2000), g(50)]);
  assert.deepEqual(grupos.map((x) => x.secciones), [[0, 1, 2], [3, 4], [5]]);
});
