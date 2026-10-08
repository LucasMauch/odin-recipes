import test from 'node:test';
import assert from 'node:assert/strict';
import { repasar, reconstruir, tarjetaNueva, estaVencida, Rating, State } from '../src/planificador.js';

const T0 = new Date('2026-01-01T10:00:00Z');
const dia = (n) => new Date(T0.getTime() + n * 86400000);

test('tarjeta nueva no está vencida', () => {
  assert.equal(estaVencida(tarjetaNueva(T0), T0), false);
});
test('Good programa en el futuro; Again, antes que Good', () => {
  const good = repasar(undefined, Rating.Good, T0);
  const again = repasar(undefined, Rating.Again, T0);
  assert.ok(new Date(good.due) > T0);
  assert.ok(new Date(again.due) <= new Date(good.due));
});
test('los intervalos crecen con aciertos sucesivos', () => {
  let c = repasar(undefined, Rating.Good, T0);
  let ahora = new Date(c.due);
  const intervalos = [];
  for (let i = 0; i < 4; i++) {
    const antes = ahora;
    c = repasar(c, Rating.Good, ahora);
    ahora = new Date(c.due);
    intervalos.push(ahora - antes);
  }
  for (let i = 1; i < intervalos.length; i++) assert.ok(intervalos[i] > intervalos[i - 1]);
  assert.equal(c.state, State.Review);
});
test('reconstruir desde el registro == aplicar incrementalmente (y es independiente del orden de entrada)', () => {
  const log = [
    { id: 'a', c: 'x', t: T0.getTime(), g: 3 },
    { id: 'b', c: 'x', t: dia(2).getTime(), g: 3 },
    { id: 'c', c: 'y', t: dia(1).getTime(), g: 1 },
  ];
  let x = repasar(undefined, 3, T0); x = repasar(x, 3, dia(2));
  const r = reconstruir(log);
  assert.deepEqual(r.x, x);
  assert.deepEqual(reconstruir([...log].reverse()), r);
});
test('un fallo después de aprender deja la tarjeta vencida pronto', () => {
  let c = repasar(undefined, 3, T0);
  c = repasar(c, 3, new Date(c.due));
  const fallo = repasar(c, 1, new Date(c.due));
  assert.ok(new Date(fallo.due) - new Date(c.due) < 2 * 86400000);
});
