import { t } from './i18n.js';
import { crearAlmacen } from './almacen.js';
import { armarSesion, armarPrueba, notaPrueba, PREGUNTAS_PRUEBA } from './sesion.js';
import { dominioLeccion, leccionActual } from './dominio.js';
import { pasosDe, lecturaCompleta, siguientePaso, minutosRestantes } from './pasos.js';
import { esperarVoces } from './voz.js';
import * as sync from './sync.js';
import { h, mostrar, campo, barra, anillo } from './ui.js';
import { iniciarQuiz, ejecutar, hablar, mostrarNota } from './quiz.js';
import { crearLeccion } from './leccion.js';

const guardado = (() => { try { return window.localStorage; } catch { return null; } })();
const almacen = crearAlmacen(guardado);
let lecciones = [], cartas = [], voz = null, rubrica = {}, vistaLec = null;
const NUMEROS = Array.from({ length: 12 }, (_, i) => i + 1);

async function cargar() {
  const idx = await (await fetch('lecciones/indice.json')).json();
  lecciones = await Promise.all(idx.map((l) => fetch(`lecciones/${l.id}.json`).then((r) => r.json())));
  cartas = lecciones.flatMap((l) => l.cartas);
  rubrica = await (await fetch('lecciones/rubrica.json')).json();
}

const habilitadas = () => new Set(lecciones.filter((l) => lecturaCompleta(pasosDe(l), almacen.pasosHechos(l.numero))).map((l) => l.numero));
const sesionDeHoy = () => {
  const lec = leccionActual(cartas, almacen.tarjetas, almacen.pruebas, NUMEROS);
  return { lec, s: armarSesion({ cartas, estados: almacen.tarjetas, leccion: 1, nuevasHoy: almacen.nuevasHoy(), conVoz: !!voz, habilitadas: habilitadas() }) };
};

// ---------- sesión diaria ----------
function sesionDiaria() {
  const { s } = sesionDeHoy();
  const salir = () => irA('#/hoy');
  const fin = () => mostrar(h('section', { class: 'quiz centro' }, h('h2', {}, t('sesion_lista')), h('button', { class: 'primario ancho', onclick: () => irA('#/progreso') }, t('nav_progreso'))));
  const prueba = () => {
    const items = armarPrueba({ cartas, estados: almacen.tarjetas });
    if (items.length < 4) return fin();
    ejecutar({ items, fase: 'fase_prueba', modo: 'prueba', salir, alTerminar: (r) => mostrarNota({ resultados: r, lec: null, volver: fin }) });
  };
  const fHablar = () => (s.hablar.length ? hablar(s.hablar, { alTerminar: prueba, salir }) : prueba());
  const fNuevo = () => (s.nuevas.length ? ejecutar({ items: s.nuevas, fase: 'fase_nuevo', modo: 'nuevo', alTerminar: fHablar, salir }) : fHablar());
  if (s.repaso.length) ejecutar({ items: s.repaso, fase: 'fase_repaso', modo: 'repaso', alTerminar: fNuevo, salir }); else fNuevo();
}

// ---------- vistas ----------
function vistaHoy() {
  const { lec, s } = sesionDeHoy();
  const l = lecciones[lec - 1];
  const pasos = pasosDe(l);
  const hechos = almacen.pasosHechos(lec);
  const sig = siguientePaso(pasos.filter((p) => p.tipo === 'texto' || p.tipo === 'tema'), hechos);
  const hayTarjetas = s.repaso.length + s.nuevas.length > 0;
  const fila = (clave, n, extra = '') => h('li', { class: n ? 'tl activo' : 'tl' }, h('span', { class: 'tl-n' }, String(n)), h('span', {}, h('strong', {}, t('tl_' + clave)), h('small', { class: 'mut' }, ' ' + t('tl_' + clave + '_d') + extra)));
  const practicadasHoy = almacen.log.filter((e) => new Date(e.t).toDateString() === new Date().toDateString()).length;
  mostrar(
    h('h2', {}, t('hoy_titulo')),
    sig ? h('section', { class: 'destacado' }, h('p', { class: 'etiqueta' }, t('hoy_leer')), h('h3', {}, `${t('leccion', { n: lec })} · ${l.titulo}`),
      h('p', { class: 'mut' }, t('hoy_leer_desc', { n: lec, i: hechos.length + 1, m: pasos.length, min: minutosRestantes(pasos.filter((p) => p.tipo === 'texto' || p.tipo === 'tema'), hechos) })),
      barra(hechos.length / pasos.length), h('button', { class: 'primario ancho', onclick: () => irA(`#/leccion/${lec}/${sig.id}`) }, `${t('continuar')}: ${sig.titulo}`)) : null,
    h('section', { class: 'tarjeta' }, h('h3', {}, t('hoy_sesion')),
      h('ul', { class: 'timeline' }, fila('repaso', s.repaso.length), fila('nuevo', s.nuevas.length), fila('hablar', s.hablar.length), fila('prueba', armarPrueba({ cartas, estados: almacen.tarjetas }).length >= 4 ? PREGUNTAS_PRUEBA : 0)),
      hayTarjetas ? h('button', { class: sig ? 'secundario ancho' : 'primario ancho', onclick: sesionDiaria }, t('hoy_empezar')) : h('p', { class: 'mut' }, sig ? t('hoy_sin_nada') : t('hoy_nada'))),
    practicadasHoy ? h('p', { class: 'mut' }, t('hoy_hecho', { n: practicadasHoy })) : null,
    !voz ? h('p', { class: 'aviso' }, t('sin_voz')) : null);
}

function vistaRuta() {
  const actual = leccionActual(cartas, almacen.tarjetas, almacen.pruebas, NUMEROS);
  mostrar(h('h2', {}, t('ruta_titulo')), h('ul', { class: 'ruta' }, ...lecciones.map((l) => {
    const d = dominioLeccion(cartas, almacen.tarjetas, almacen.pruebas, l.numero);
    const pasos = pasosDe(l), hechos = almacen.pasosHechos(l.numero);
    return h('li', {}, h('a', { class: 'fila-leccion', href: `#/leccion/${l.numero}` },
      anillo(hechos.length / pasos.length, String(l.numero)),
      h('span', { class: 'fila-txt' }, h('strong', {}, l.titulo),
        h('small', { class: 'mut' }, `${t('paso_de', { i: hechos.length, m: pasos.length })} · ${t('lec_estado', { a: d.recordadas, b: d.total })}`)),
      d.dominada ? h('span', { class: 'insignia' }, t('dominada')) : l.numero === actual ? h('span', { class: 'insignia' }, t('recomendada')) : null));
  })));
}

function descargar(nombre, texto) {
  const a = h('a', { href: URL.createObjectURL(new Blob([texto], { type: 'application/json' })), download: nombre });
  document.body.append(a); a.click(); a.remove();
}

function vistaProgreso() {
  const filas = lecciones.map((l) => {
    const d = dominioLeccion(cartas, almacen.tarjetas, almacen.pruebas, l.numero);
    return h('li', { class: 'fila-prog' }, h('strong', {}, t('leccion', { n: l.numero })), d.dominada ? h('span', { class: 'insignia' }, t('dominada')) : null,
      barra(d.fraccion), h('small', { class: 'mut' }, t('lec_estado', { a: d.recordadas, b: d.total }) + ' · ' + (d.nota == null ? t('sin_prueba') : t('ultima_nota', { n: d.nota }))));
  });
  const archivo = h('input', { type: 'file', accept: 'application/json', 'aria-label': t('importar') });
  const msg = h('p', { 'aria-live': 'polite' });
  archivo.addEventListener('change', async () => {
    try { msg.textContent = t('importado', { n: almacen.importar(await archivo.files[0].text()) }); } catch (e) { msg.textContent = e.message; }
  });
  const globalBtn = h('button', { class: 'secundario ancho', onclick: () => ejecutar({ items: armarPrueba({ cartas, estados: almacen.tarjetas, n: 12 }), fase: 'fase_prueba', modo: 'prueba', salir: () => irA('#/progreso'), alTerminar: (r) => mostrarNota({ resultados: r, lec: null, volver: () => irA('#/progreso') }) }) }, t('prueba_global'));
  const syncCaja = h('section', { class: 'tarjeta' }, h('h3', {}, t('sync_titulo')));
  if (!sync.disponible()) syncCaja.append(h('p', { class: 'mut' }, t('sync_sin_servidor')));
  else {
    const salida = h('p', { 'aria-live': 'polite' });
    const codigoIn = campo({ 'aria-label': t('sync_usar'), placeholder: 'XXXXX-XXXXX-…' });
    const hacer = async (codigo) => { try { almacen.ajustar({ codigo }); salida.textContent = t('importado', { n: await sync.sincronizar(almacen, codigo) }); } catch (e) { salida.textContent = e.message; } };
    syncCaja.append(h('button', { class: 'secundario', onclick: () => { const c = sync.generarCodigo(); salida.textContent = t('sync_codigo') + ' ' + c; hacer(c); } }, t('sync_crear')),
      h('div', { class: 'fila' }, codigoIn, h('button', { class: 'secundario', onclick: () => hacer(sync.normalizarCodigo(codigoIn.value)) }, t('sync_usar'))),
      almacen.ajustes.codigo ? h('button', { class: 'secundario', onclick: () => hacer(almacen.ajustes.codigo) }, t('sync_ahora')) : null, salida);
  }
  mostrar(h('h2', {}, t('progreso_titulo')), h('p', { class: 'mut' }, t('criterio')), h('ul', { class: 'prog' }, ...filas), globalBtn,
    h('section', { class: 'tarjeta' }, h('h3', {}, t('copia')), h('div', { class: 'fila' }, h('button', { class: 'secundario', onclick: () => descargar('mia-vojo-progreso.json', almacen.exportar()) }, t('exportar')), archivo), msg), syncCaja);
}

function vistaAyuda() {
  mostrar(h('h2', {}, t('ayuda_titulo')), h('section', { class: 'tarjeta' }, h('p', {}, t('chuleta_terminaciones')), h('p', {}, t('chuleta_sonidos'))),
    h('section', { class: 'tarjeta' }, h('h3', {}, t('creditos')),
      h('p', {}, 'Curso: Zlatko Tišljar, Spomenka Štimec, Ivica Špoljarec, Roger Imbert (método Zagreb). Textos en esperanto © sus autores, CC BY-ND 4.0, sin cambios. Traducción al español: Enric Baltasar, Alejandro Escobedo, Guillermo Molleda Jimena (CC BY 4.0). Audio: Emilio Cid. Sitio: Georg Jähnig, Joop Kiefte. Planificador: ts-fsrs (MIT).'),
      h('p', {}, h('a', { href: 'https://github.com/Esperanto/kurso-zagreba-metodo', rel: 'noopener' }, 'github.com/Esperanto/kurso-zagreba-metodo'), ' · ', h('a', { href: 'ATRIBUCIONES.md' }, 'ATRIBUCIONES'))));
}

// ---------- router ----------
const VISTAS = { hoy: vistaHoy, ruta: vistaRuta, progreso: vistaProgreso, ayuda: vistaAyuda };
export function irA(hash) { if (location.hash === hash) render(); else location.hash = hash; }
function render() {
  const [, ruta = 'hoy', arg, id] = location.hash.split('/');
  if (ruta === 'leccion' && lecciones[+arg - 1]) (id ? vistaLec.paso(+arg, id) : vistaLec.resumen(+arg)); else (VISTAS[ruta] ?? vistaHoy)();
  document.getElementById('nav').replaceChildren(...['hoy', 'ruta', 'progreso', 'ayuda'].map((r) =>
    h('button', { 'aria-current': r === ruta || (ruta === 'leccion' && r === 'ruta') ? 'page' : null, onclick: () => irA('#/' + r) }, t('nav_' + r))));
}

(async () => {
  document.getElementById('lema').textContent = t('app_lema');
  try { await cargar(); } catch (e) { return mostrar(h('p', { class: 'res-mal' }, 'No se pudieron cargar las lecciones: ' + e.message)); }
  voz = await esperarVoces();
  iniciarQuiz({ almacen, voz: () => voz });
  vistaLec = crearLeccion({ almacen, lecciones, cartas, irA, rubrica });
  window.addEventListener('hashchange', render);
  render();
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
