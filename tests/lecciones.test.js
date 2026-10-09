import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const cargar = (n) => JSON.parse(readFileSync(new URL(`../lecciones/${String(n).padStart(2, '0')}.json`, import.meta.url)));

test('las 12 lecciones existen y son coherentes', () => {
  const ids = new Set();
  for (let n = 1; n <= 12; n++) {
    const l = cargar(n);
    assert.equal(l.numero, n);
    assert.ok(l.titulo && l.texto.parrafos.length > 0 && l.gramatica.length >= 1 && l.gramatica.every((g) => g.titulo && g.md.length > 20));
    assert.equal(l.texto.licencia, 'CC BY-ND 4.0');
    assert.ok(l.cartas.length >= 20, `lección ${n}: pocas tarjetas`);
    for (const c of l.cartas) {
      assert.ok(!ids.has(c.id), `id duplicado ${c.id}`); ids.add(c.id);
      assert.equal(c.lec, n);
      assert.ok(c.es && c.eo, c.id);
      if (c.tipo === 'cloze') {
        assert.ok(c.huecos.length > 0);
        let p = c.plantilla;
        c.huecos.forEach((h, i) => { p = p.replace(`{${i}}`, h); });
        assert.equal(p.replace(/\s+/g, ''), c.eo.replace(/\s+/g, ''), c.id);
      }
    }
  }
});
test('el texto de la lección 1 es el original sin cambios (muestra)', () => {
  assert.ok(cargar(1).texto.parrafos[0].startsWith('Marko estas mia amiko.'));
});
