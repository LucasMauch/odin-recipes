// Criterios de dominio (propuesta propia, no validada empíricamente; ver docs/INVESTIGACION.md).
import { State } from './planificador.js';

export const CRITERIOS = {
  estabilidadMinDias: 3,   // «recordada» = estabilidad FSRS ≥ 3 días
  fraccionMin: 0.8,        // 80 % de las tarjetas de la lección recordadas…
  notaMin: 90,             // …y ≥ 90 en la última prueba de esa lección
};

export function recordada(estado) {
  return !!estado && estado.state === State.Review && estado.stability >= CRITERIOS.estabilidadMinDias;
}

/** @returns {{total:number,vistas:number,recordadas:number,fraccion:number,nota:number|null,dominada:boolean}} */
export function dominioLeccion(cartas, estados, pruebas, lec) {
  const delLec = cartas.filter((c) => c.lec === lec);
  const total = delLec.length;
  const vistas = delLec.filter((c) => estados[c.id]).length;
  const recordadas = delLec.filter((c) => recordada(estados[c.id])).length;
  const fraccion = total ? recordadas / total : 0;
  const ultima = [...pruebas].filter((p) => p.lec === lec).sort((a, b) => b.t - a.t)[0];
  const nota = ultima ? ultima.nota : null;
  return {
    total, vistas, recordadas, fraccion, nota,
    dominada: fraccion >= CRITERIOS.fraccionMin && nota !== null && nota >= CRITERIOS.notaMin,
  };
}

/** La lección «actual» es la primera no dominada. */
export function leccionActual(cartas, estados, pruebas, numeros) {
  for (const n of numeros) if (!dominioLeccion(cartas, estados, pruebas, n).dominada) return n;
  return numeros[numeros.length - 1];
}
