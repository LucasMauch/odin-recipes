// Una lección = camino de pasos cortos (texto, un tema de gramática por pantalla, práctica, prueba).
const MIN = { texto: 3, practica: 4, prueba: 3 };

const MIN_CARACTERES = 450; // un tema corto se agrupa con el siguiente para no crear pantallas diminutas
const MAX_POR_GRUPO = 3;

/** Agrupa secciones consecutivas de gramática en temas de lectura de ~2-4 min. */
export function agruparTemas(gramatica) {
  const grupos = [];
  let actual = null;
  gramatica.forEach((g, i) => {
    if (actual && actual.chars < MIN_CARACTERES && actual.secciones.length < MAX_POR_GRUPO) {
      actual.secciones.push(i); actual.chars += g.md.length; actual.titulos.push(g.titulo);
    } else {
      actual = { secciones: [i], chars: g.md.length, titulos: [g.titulo] };
      grupos.push(actual);
    }
  });
  return grupos;
}

export function pasosDe(leccion) {
  const temas = agruparTemas(leccion.gramatica).map((g, k) => ({
    id: `t${k}`, tipo: 'tema', indice: k, secciones: g.secciones,
    titulo: g.titulos.join(' · '), minutos: Math.max(1, Math.round(g.chars / 900) + 1),
  }));
  return [
    { id: 'texto', tipo: 'texto', titulo: 'Leer y escuchar el texto', minutos: MIN.texto },
    ...temas,
    { id: 'practica', tipo: 'practica', titulo: 'Practicar lo nuevo', minutos: MIN.practica },
    { id: 'prueba', tipo: 'prueba', titulo: 'Prueba de la lección', minutos: MIN.prueba },
  ];
}

/** Lectura completa = texto + todos los temas (la práctica puede empezar). */
export function lecturaCompleta(pasos, hechos = []) {
  return pasos.filter((p) => p.tipo === 'texto' || p.tipo === 'tema').every((p) => hechos.includes(p.id));
}

export function siguientePaso(pasos, hechos = []) {
  return pasos.find((p) => !hechos.includes(p.id)) ?? null;
}

export const minutosRestantes = (pasos, hechos = []) => pasos.filter((p) => !hechos.includes(p.id)).reduce((s, p) => s + p.minutos, 0);
