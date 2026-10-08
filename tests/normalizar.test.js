import test from 'node:test';
import assert from 'node:assert/strict';
import { aplicarSistemaX, normalizar, evaluar } from '../src/normalizar.js';

test('sistema x convierte las seis letras, en minúscula y mayúscula', () => {
  assert.equal(aplicarSistemaX('cxambro gxis hxoro jxurnalo sxi auxto'), 'ĉambro ĝis ĥoro ĵurnalo ŝi aŭto');
  assert.equal(aplicarSistemaX('Cxu CXu Sxi'), 'Ĉu Ĉu Ŝi');
});
test('sistema x no toca otras x ni el texto normal', () => {
  assert.equal(aplicarSistemaX('taxi extra'), 'taxi extra');
});
test('normalizar: mayúsculas, puntuación, espacios, signos españoles', () => {
  assert.equal(normalizar('  ¿Ĉu   VI laboras?  '), 'ĉu vi laboras');
  assert.equal(normalizar('Cxu vi laboras?'), 'ĉu vi laboras');
});
test('evaluar: ok con sistema x, mayúsculas y puntuación', () => {
  assert.equal(evaluar('cxu la libro estas bona!', 'Ĉu la libro estas bona?'), 'ok');
});
test('evaluar: casi si faltan diacríticos', () => {
  assert.equal(evaluar('cambro', 'ĉambro'), 'casi');
});
test('evaluar: casi con un typo en frase larga; mal con palabra corta distinta', () => {
  assert.equal(evaluar('Mia nomo estas Marku', 'Mia nomo estas Marko'), 'casi');
  assert.equal(evaluar('libro', 'libra'), 'mal');
  assert.equal(evaluar('', 'libro'), 'mal');
});
test('evaluar: acepta cualquiera de varias respuestas válidas', () => {
  assert.equal(evaluar('instruisto', ['instruanto', 'instruisto']), 'ok');
});
