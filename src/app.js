import { t } from './i18n.js';
import { crearAlmacen } from './almacen.js';
import { aplicarSistemaX } from './normalizar.js';
import { armarSesion, armarPrueba, evaluarCarta, aCalificacion, notaPrueba, NUEVAS_POR_DIA, PREGUNTAS_PRUEBA } from './sesion.js';
import { dominioLeccion, leccionActual, CRITERIOS } from './dominio.js';
import { mdAHtml } from './md.js';
import { esperarVoces, decir, puedeGrabar, crearGrabadora } from './voz.js';
import { AUDIO_BASE } from './config.js';
import * as sync from './sync.js';

// ---------- utilidades DOM ----------
const h = (tag, attrs = {}, ...hijos) => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs ?? {})) {
    if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (v === true) el.setAttribute(k, '');
    else if (v !== false && v != null) el.setAttribute(k, v);
  }
  for (const c of hijos.flat()) if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(c));
  return el;
};
const $main = () => document.getElementById('principal');
const mostrar = (...nodos) => { const m = $main(); m.replaceChildren(...nodos); m.focus({ preventScroll: true }); window.scrollTo(0, 0); };
const guardado = (() => { try { return window.localStorage; } catch { return null; } })();

// ---------- estado global ----------
const almacen = crearAlmacen(guardado);
let lecciones = [];
let cartas = [];
let voz = null;
const NUMEROS = Array.from({ length: 12 }, (_, i) => i + 1);

async function cargar() {
  const idx = await (await fetch('lecciones/indice.json')).json();
  lecciones = await Promise.all(idx.map((l) => fetch(`lecciones/${l.id}.json`).then((r) => r.json())));
  cartas = lecciones.flatMap((l) => l.cartas);
  window.__rubrica = await (await fetch('lecciones/rubrica.json')).json();
}

// ---------- teclado de letras ----------
let ultimoInput = null;
function campo(attrs = {}) {
  const i = h('input', { type: 'text', autocomplete: 'off', autocapitalize: 'none', spellcheck: 'false', lang: 'eo', ...attrs });
  i.addEventListener('focus', () => { ultimoInput = i; });
  i.addEventListener('input', () => {
    const antes = i.value, pos = i.selectionStart;
    const despues = aplicarSistemaX(antes);
    if (despues !== antes) { i.value = despues; const p = Math.max(0, pos - (antes.length - despues.length)); i.setSelectionRange(p, p); }
  });
  return i;
}
function teclado() {
  const insertar = (l) => {
    const i = ultimoInput; if (!i) return;
    const a = i.selectionStart ?? i.value.length, b = i.selectionEnd ?? a;
    i.value = i.value.slice(0, a) + l + i.value.slice(b);
    i.focus(); i.setSelectionRange(a + 1, a + 1);
  };
  return h('div', { class: 'teclas', role: 'group', 'aria-label': t('teclado_letras') },
    ...['ĉ', 'ĝ', 'ĥ', 'ĵ', 'ŝ', 'ŭ'].map((l) => h('button', { type: 'button', 'aria-label': l, onmousedown: (e) => e.preventDefault(), onclick: () => insertar(l) }, l)),
    h('small', { class: 'mut' }, t('teclado_ayuda')));
}

// ---------- ejecución de una cola de tarjetas ----------
function ejecutar({ items, fase, modo, alTerminar }) {
  // modo: 'repaso' (escribir + reescribir si falla) | 'nuevo' (ver, tapar, escribir) | 'prueba' (sin ayudas)
  let i = 0;
  const resultados = [];
  const paso = () => {
    if (i >= items.length) return alTerminar(resultados);
    const c = items[i];
    const cab = h('p', { class: 'mut' }, `${t(fase)} · ${t('pregunta_n', { i: i + 1, n: items.length })}`);
    const raiz = h('div', { class: 'tarjeta' });
    const preguntar = () => {
      raiz.replaceChildren(cab);
      const inputs = [];
      if (c.tipo === 'dictado') {
        raiz.append(h('p', {}, t('escribi_dictado')), h('button', { type: 'button', onclick: () => decir(c.eo, voz) }, '🔊 ' + t('escuchar')));
        const inp = campo({ 'aria-label': t('escribi_dictado') }); inputs.push(inp); raiz.append(h('div', { class: 'fila' }, inp));
        setTimeout(() => decir(c.eo, voz), 200);
      } else if (c.tipo === 'cloze') {
        raiz.append(h('p', {}, t('completa_huecos')), h('p', { class: 'mut' }, c.es));
        const p = h('p', { class: 'grande', lang: 'eo' });
        for (const trozo of c.plantilla.split(/(\{\d+\})/)) {
          const m = trozo.match(/^\{(\d+)\}$/);
          if (m) { const inp = campo({ class: 'hueco', 'aria-label': `Hueco ${+m[1] + 1}` }); inputs[+m[1]] = inp; p.append(inp); } else p.append(trozo);
        }
        raiz.append(p);
      } else {
        raiz.append(h('p', {}, t('escribi_eo')), h('p', { class: 'grande' }, c.es));
        const inp = campo({ 'aria-label': t('escribi_eo') }); inputs.push(inp); raiz.append(h('div', { class: 'fila' }, inp));
      }
      raiz.append(teclado());
      const fb = h('div', { 'aria-live': 'assertive' });
      const boton = h('button', { class: 'primario', type: 'button' }, t('comprobar'));
      const comprobar = () => {
        const resp = c.tipo === 'cloze' ? inputs.map((x) => x.value) : inputs[0].value;
        const res = evaluarCarta(c, resp);
        resultados.push(res);
        inputs.forEach((x) => { x.readOnly = true; });
        boton.disabled = true;
        if (modo === 'prueba') return avanzar();
        almacen.registrarRepaso(c.id, aCalificacion[res]);
        if (res === 'ok') { fb.replaceChildren(h('p', { class: 'res-ok' }, '✔ ' + t('ok'))); return setTimeout(avanzar, 700); }
        fb.replaceChildren(h('p', { class: res === 'casi' ? 'res-casi' : 'res-mal' }, (res === 'casi' ? t('casi') : t('mal')) + ' '), h('p', { class: 'grande', lang: 'eo' }, c.eo), h('p', {}, t('reescribi')));
        const re = campo({ 'aria-label': t('reescribi') });
        const ok = h('button', { class: 'primario', type: 'button', disabled: true, onclick: avanzar }, t('siguiente'));
        re.addEventListener('input', () => { ok.disabled = evaluarCarta({ ...c, tipo: 'palabra' }, re.value) !== 'ok'; });
        fb.append(h('div', { class: 'fila' }, re), ok);
        re.focus();
      };
      boton.addEventListener('click', comprobar);
      raiz.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !boton.disabled) { e.preventDefault(); comprobar(); } });
      raiz.append(h('div', { class: 'fila' }, boton), fb);
      inputs[0]?.focus();
    };
    const avanzar = () => { i++; paso(); };
    if (modo === 'nuevo') {
      raiz.append(cab, h('p', {}, t('memoriza')), h('p', { class: 'mut' }, c.es), h('p', { class: 'grande', lang: 'eo' }, c.eo),
        voz ? h('button', { type: 'button', onclick: () => decir(c.eo, voz) }, '🔊 ' + t('escuchar')) : null,
        h('div', { class: 'fila' }, h('button', { class: 'primario', type: 'button', onclick: preguntar }, t('tapar'))));
    } else preguntar();
    mostrar(raiz);
  };
  paso();
}

// ---------- fase hablar ----------
function hablar(items, alTerminar) {
  let i = 0;
  const paso = () => {
    if (i >= items.length) return alTerminar();
    const c = items[i];
    const caja = h('div', { class: 'tarjeta' }, h('p', { class: 'mut' }, `${t('fase_hablar')} · ${t('pregunta_n', { i: i + 1, n: items.length })}`),
      h('p', {}, t('habla_paso1')), h('p', { class: 'mut' }, c.es), h('p', { class: 'grande', lang: 'eo' }, c.eo));
    if (voz) caja.append(h('button', { type: 'button', onclick: () => decir(c.eo, voz) }, '🔊 ' + t('escuchar')));
    else caja.append(h('p', { class: 'res-casi' }, t('sin_voz')), h('audio', { controls: true, preload: 'none', src: `${AUDIO_BASE}${String(c.lec).padStart(2, '0')}.mp3` }), h('p', { class: 'mut' }, t('audio_curso')));
    const zona = h('div');
    if (puedeGrabar()) {
      let grab = null;
      const b = h('button', { type: 'button' }, '⏺ ' + t('grabar'));
      b.addEventListener('click', async () => {
        try {
          if (!grab) { grab = await crearGrabadora(); grab.empezar(); b.textContent = '⏹ ' + t('parar'); return; }
          const url = await grab.parar(); grab = null; b.textContent = '⏺ ' + t('grabar');
          zona.replaceChildren(h('p', { class: 'mut' }, t('tu_grabacion')), h('audio', { controls: true, src: url }));
        } catch { zona.replaceChildren(h('p', { class: 'res-mal' }, t('sin_microfono'))); }
      });
      caja.append(h('div', { class: 'fila' }, b), zona);
    } else caja.append(h('p', { class: 'mut' }, t('sin_microfono')));
    caja.append(h('p', {}, t('como_te_sono')), h('div', { class: 'fila' }, ...[['😕', 1], ['🙂', 2], ['😀', 3], ['🎯', 4]].map(([e, n]) =>
      h('button', { type: 'button', 'aria-label': `${n}/4`, onclick: () => { almacen.registrarHabla({ carta: c.id, auto: n }); i++; paso(); } }, e))));
    mostrar(caja);
  };
  paso();
}

// ---------- pantalla final de una prueba ----------
function mostrarNota({ nota, lec, volver }) {
  almacen.registrarPrueba({ lec, nota, n: PREGUNTAS_PRUEBA });
  mostrar(h('div', { class: 'tarjeta' }, h('h2', {}, t('nota_final', { nota })), h('p', {}, nota >= CRITERIOS.notaMin ? t('nota_aprobada') : t('nota_mejorar')),
    h('button', { class: 'primario', onclick: volver }, t('siguiente'))));
}

// ---------- sesión diaria ----------
function sesionDiaria() {
  const lec = leccionActual(cartas, almacen.tarjetas, almacen.pruebas, NUMEROS);
  const s = armarSesion({ cartas, estados: almacen.tarjetas, leccion: lec, nuevasHoy: almacen.nuevasHoy(), conVoz: !!voz });
  const fin = () => mostrar(h('div', { class: 'tarjeta' }, h('h2', {}, t('sesion_lista')), h('button', { onclick: () => irA('#/progreso') }, t('nav_progreso'))));
  const prueba = () => {
    const items = armarPrueba({ cartas, estados: almacen.tarjetas });
    if (items.length < 4) return fin();
    ejecutar({ items, fase: 'fase_prueba', modo: 'prueba', alTerminar: (r) => mostrarNota({ nota: notaPrueba(r), lec: null, volver: fin }) });
  };
  const fHablar = () => (s.hablar.length ? hablar(s.hablar, prueba) : prueba());
  const fNuevo = () => (s.nuevas.length ? ejecutar({ items: s.nuevas, fase: 'fase_nuevo', modo: 'nuevo', alTerminar: fHablar }) : fHablar());
  if (s.repaso.length) ejecutar({ items: s.repaso, fase: 'fase_repaso', modo: 'repaso', alTerminar: fNuevo }); else fNuevo();
}

// ---------- vistas ----------
function vistaHoy() {
  const lec = leccionActual(cartas, almacen.tarjetas, almacen.pruebas, NUMEROS);
  const s = armarSesion({ cartas, estados: almacen.tarjetas, leccion: lec, nuevasHoy: almacen.nuevasHoy(), conVoz: !!voz });
  mostrar(h('h2', {}, t('hoy_titulo')),
    h('div', { class: 'tarjeta' },
      h('p', {}, t('leccion', { n: lec }) + ' · ' + lecciones[lec - 1].titulo),
      h('p', {}, t('hoy_resumen', { r: s.repaso.length, n: s.nuevas.length, h: s.hablar.length, p: PREGUNTAS_PRUEBA })),
      h('button', { class: 'primario', onclick: sesionDiaria }, t('hoy_empezar'))),
    !voz ? h('p', { class: 'mut' }, t('sin_voz')) : null);
}

function barra(frac) { return h('div', { class: 'progreso', role: 'img', 'aria-label': `${Math.round(frac * 100)}%` }, h('i', { style: `width:${Math.round(frac * 100)}%` })); }

function vistaRuta() {
  const actual = leccionActual(cartas, almacen.tarjetas, almacen.pruebas, NUMEROS);
  mostrar(h('h2', {}, t('ruta_titulo')), ...lecciones.map((l) => {
    const d = dominioLeccion(cartas, almacen.tarjetas, almacen.pruebas, l.numero);
    return h('div', { class: 'tarjeta' },
      h('h3', {}, t('leccion', { n: l.numero }) + ' · ' + l.titulo, d.dominada ? h('span', { class: 'insignia' }, t('dominada')) : l.numero === actual ? h('span', { class: 'insignia' }, t('recomendada')) : null),
      barra(d.fraccion), h('p', { class: 'mut' }, t('tarjetas_recordadas', { a: d.recordadas, b: d.total })),
      h('button', { onclick: () => irA(`#/leccion/${l.numero}`) }, t('abrir')));
  }));
}

function vistaLeccion(n) {
  const l = lecciones[n - 1];
  const d = dominioLeccion(cartas, almacen.tarjetas, almacen.pruebas, n);
  const vuelta = () => irA(`#/leccion/${n}`);
  const practicar = () => {
    const vistas = l.cartas.filter((c) => almacen.tarjetas[c.id]);
    const nuevas = l.cartas.filter((c) => !almacen.tarjetas[c.id]).slice(0, 8);
    const seguir = () => (vistas.length ? ejecutar({ items: vistas.slice(0, 12), fase: 'fase_repaso', modo: 'repaso', alTerminar: vuelta }) : vuelta());
    nuevas.length ? ejecutar({ items: nuevas, fase: 'fase_nuevo', modo: 'nuevo', alTerminar: seguir }) : seguir();
  };
  const prueba = () => ejecutar({ items: armarPrueba({ cartas, estados: almacen.tarjetas, leccion: n }), fase: 'fase_prueba', modo: 'prueba', alTerminar: (r) => mostrarNota({ nota: notaPrueba(r), lec: n, volver: vuelta }) });
  const rub = window.__rubrica?.[String(n)] ?? [];
  const g = h('div', { class: 'gramatica' }); g.innerHTML = mdAHtml(l.gramatica_md);
  mostrar(h('p', {}, h('a', { href: '#/ruta' }, '← ' + t('nav_ruta'))), h('h2', {}, t('leccion', { n }) + ' · ' + l.titulo),
    barra(d.fraccion), h('p', { class: 'mut' }, t('tarjetas_recordadas', { a: d.recordadas, b: d.total }) + ' · ' + (d.nota == null ? t('sin_prueba') : t('ultima_nota', { n: d.nota }))),
    h('div', { class: 'fila' }, h('button', { class: 'primario', onclick: practicar }, t('practicar')), h('button', { onclick: prueba }, t('prueba_leccion'))),
    h('div', { class: 'tarjeta texto-curso', lang: 'eo' }, h('h3', {}, t('texto_curso')), ...l.texto.parrafos.map((p) => h('p', {}, p)),
      h('audio', { controls: true, preload: 'none', src: `${AUDIO_BASE}${l.id}.mp3` }), h('small', { class: 'mut' }, t('audio_curso'))),
    h('div', { class: 'tarjeta' }, h('h3', {}, t('puedo_hacer')), h('ul', {}, ...rub.map((x) => h('li', {}, x)))),
    h('div', { class: 'tarjeta' }, h('h3', {}, t('vocab_raices')), h('p', { lang: 'eo' }, (l.raices_nuevas ?? []).join(' · '))),
    h('div', { class: 'tarjeta' }, h('h3', {}, t('gramatica')), g));
}

function descargar(nombre, texto) {
  const a = h('a', { href: URL.createObjectURL(new Blob([texto], { type: 'application/json' })), download: nombre });
  document.body.append(a); a.click(); a.remove();
}

function vistaProgreso() {
  const filas = lecciones.map((l) => {
    const d = dominioLeccion(cartas, almacen.tarjetas, almacen.pruebas, l.numero);
    return h('div', { class: 'tarjeta' }, h('strong', {}, t('leccion', { n: l.numero })), d.dominada ? h('span', { class: 'insignia' }, t('dominada')) : null,
      barra(d.fraccion), h('small', { class: 'mut' }, t('tarjetas_recordadas', { a: d.recordadas, b: d.total }) + ' · ' + (d.nota == null ? t('sin_prueba') : t('ultima_nota', { n: d.nota }))));
  });
  const archivo = h('input', { type: 'file', accept: 'application/json', 'aria-label': t('importar') });
  const msg = h('p', { 'aria-live': 'polite' });
  archivo.addEventListener('change', async () => {
    try { msg.textContent = t('importado', { n: almacen.importar(await archivo.files[0].text()) }); } catch (e) { msg.textContent = e.message; }
  });
  const globalBtn = h('button', { onclick: () => ejecutar({ items: armarPrueba({ cartas, estados: almacen.tarjetas, n: 12 }), fase: 'fase_prueba', modo: 'prueba', alTerminar: (r) => mostrarNota({ nota: notaPrueba(r), lec: null, volver: () => irA('#/progreso') }) }) }, t('prueba_global'));
  const syncCaja = h('div', { class: 'tarjeta' }, h('h3', {}, t('sync_titulo')));
  if (!sync.disponible()) syncCaja.append(h('p', { class: 'mut' }, t('sync_sin_servidor')));
  else {
    const salida = h('p', { 'aria-live': 'polite' });
    const codigoIn = campo({ 'aria-label': t('sync_usar'), placeholder: 'XXXXX-XXXXX-…' });
    const hacer = async (codigo) => { try { almacen.ajustar({ codigo }); salida.textContent = t('importado', { n: await sync.sincronizar(almacen, codigo) }); } catch (e) { salida.textContent = e.message; } };
    syncCaja.append(h('button', { onclick: () => { const c = sync.generarCodigo(); salida.textContent = t('sync_codigo') + ' ' + c; hacer(c); } }, t('sync_crear')),
      h('div', { class: 'fila' }, codigoIn, h('button', { onclick: () => hacer(sync.normalizarCodigo(codigoIn.value)) }, t('sync_usar'))),
      almacen.ajustes.codigo ? h('button', { onclick: () => hacer(almacen.ajustes.codigo) }, t('sync_ahora')) : null, salida);
  }
  mostrar(h('h2', {}, t('progreso_titulo')), h('p', { class: 'mut' }, t('criterio')), ...filas, globalBtn,
    h('div', { class: 'tarjeta' }, h('h3', {}, t('copia')), h('div', { class: 'fila' }, h('button', { onclick: () => descargar('mia-vojo-progreso.json', almacen.exportar()) }, t('exportar')), archivo), msg), syncCaja);
}

function vistaAyuda() {
  mostrar(h('h2', {}, t('ayuda_titulo')), h('div', { class: 'tarjeta' }, h('p', {}, t('chuleta_terminaciones')), h('p', {}, t('chuleta_sonidos'))),
    h('div', { class: 'tarjeta' }, h('h3', {}, t('creditos')),
      h('p', {}, 'Curso: Zlatko Tišljar, Spomenka Štimec, Ivica Špoljarec, Roger Imbert (método Zagreb). Textos en esperanto © sus autores, CC BY-ND 4.0, sin cambios. Traducción al español: Enric Baltasar, Alejandro Escobedo, Guillermo Molleda Jimena (CC BY 4.0). Audio: Emilio Cid. Sitio: Georg Jähnig, Joop Kiefte. Planificador: ts-fsrs (MIT).'),
      h('p', {}, h('a', { href: 'https://github.com/Esperanto/kurso-zagreba-metodo', rel: 'noopener' }, 'github.com/Esperanto/kurso-zagreba-metodo'), ' · ', h('a', { href: 'ATRIBUCIONES.md' }, 'ATRIBUCIONES'))));
}

// ---------- router ----------
const VISTAS = { hoy: vistaHoy, ruta: vistaRuta, progreso: vistaProgreso, ayuda: vistaAyuda };
function irA(hash) { if (location.hash === hash) render(); else location.hash = hash; }
function render() {
  const [, ruta = 'hoy', arg] = location.hash.split('/');
  if (ruta === 'leccion' && lecciones[+arg - 1]) vistaLeccion(+arg); else (VISTAS[ruta] ?? vistaHoy)();
  document.getElementById('nav').replaceChildren(...['hoy', 'ruta', 'progreso', 'ayuda'].map((r) =>
    h('button', { 'aria-current': r === ruta || (ruta === 'leccion' && r === 'ruta') ? 'page' : null, onclick: () => irA('#/' + r) }, t('nav_' + r))));
}

(async () => {
  document.getElementById('lema').textContent = t('app_lema');
  try { await cargar(); } catch (e) { return mostrar(h('p', { class: 'res-mal' }, 'No se pudieron cargar las lecciones: ' + e.message)); }
  voz = await esperarVoces();
  window.addEventListener('hashchange', render);
  render();
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
