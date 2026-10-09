// Pantallas de una lección: resumen con pasos, texto interactivo y un tema por pantalla.
import { t } from './i18n.js';
import { h, mostrar, barra } from './ui.js';
import { mdAHtml } from './md.js';
import { pasosDe, siguientePaso, minutosRestantes } from './pasos.js';
import { describirPalabra, ETIQUETA_CLASE } from './texto.js';
import { dominioLeccion } from './dominio.js';
import { armarPrueba, notaPrueba } from './sesion.js';
import { ejecutar, mostrarNota } from './quiz.js';
import { AUDIO_BASE } from './config.js';

export function crearLeccion({ almacen, lecciones, cartas, irA, rubrica }) {
  const ir = (n, id) => irA(id ? `#/leccion/${n}/${id}` : `#/leccion/${n}`);

  function resumen(n) {
    const l = lecciones[n - 1];
    const pasos = pasosDe(l);
    const hechos = almacen.pasosHechos(n);
    const sig = siguientePaso(pasos, hechos);
    const d = dominioLeccion(cartas, almacen.tarjetas, almacen.pruebas, n);
    const lista = h('ol', { class: 'pasos' }, ...pasos.map((p, i) => {
      const estado = hechos.includes(p.id) ? 'hecho' : p === sig ? 'actual' : 'pend';
      return h('li', { class: `paso ${estado}` },
        h('button', { type: 'button', class: 'paso-btn', onclick: () => ir(n, p.id) },
          h('span', { class: 'marca', 'aria-hidden': 'true' }, estado === 'hecho' ? '✓' : String(i + 1)),
          h('span', { class: 'paso-tit' }, p.titulo, h('small', {}, ` · ${t('min', { n: p.minutos })}`)),
          h('span', { class: 'sr' }, t(estado === 'hecho' ? 'paso_hecho' : estado === 'actual' ? 'paso_actual' : 'paso_pend'))));
    }));
    const rub = rubrica?.[String(n)] ?? [];
    mostrar(
      h('a', { class: 'enlace', href: '#/ruta' }, '← ' + t('nav_ruta')),
      h('header', { class: 'enc-leccion' }, h('p', { class: 'etiqueta' }, t('leccion', { n })), h('h2', {}, l.titulo),
        barra(hechos.length / pasos.length, t('paso_de', { i: hechos.length, m: pasos.length })),
        h('p', { class: 'mut' }, t('paso_de', { i: Math.min(hechos.length + 1, pasos.length), m: pasos.length }) + ' · ' + t('lec_estado', { a: d.recordadas, b: d.total }))),
      sig ? h('button', { class: 'primario ancho', onclick: () => ir(n, sig.id) }, `${t('continuar')}: ${sig.titulo}`) : h('p', { class: 'res-ok' }, '✔ ' + t('dominada')),
      h('h3', {}, t('ver_pasos')), lista,
      rub.length ? h('details', { class: 'plegable' }, h('summary', {}, t('puedo_hacer')), h('ul', {}, ...rub.map((x) => h('li', {}, x)))) : null,
      (l.raices_nuevas ?? []).length ? h('details', { class: 'plegable' }, h('summary', {}, t('vocab_raices')), h('p', { lang: 'eo' }, l.raices_nuevas.join(' · '))) : null);
  }

  function barraPasos(n, pasos, idx, { siguienteTxt, alSiguiente, deshabilitar = false }) {
    const ant = pasos[idx - 1];
    return h('div', { class: 'barra-fija' },
      h('button', { type: 'button', class: 'secundario', onclick: () => (ant ? ir(n, ant.id) : ir(n)) }, '← ' + t('anterior')),
      h('button', { type: 'button', class: 'primario', disabled: deshabilitar, onclick: alSiguiente }, siguienteTxt));
  }

  function cabeceraPaso(n, pasos, idx) {
    return h('div', { class: 'cab-paso' }, h('a', { class: 'enlace', href: `#/leccion/${n}` }, '← ' + t('leccion', { n })),
      h('span', { class: 'mut' }, t('paso_de', { i: idx + 1, m: pasos.length })), barra((idx + 1) / pasos.length, t('paso_de', { i: idx + 1, m: pasos.length })));
  }

  function terminarPaso(n, pasos, idx) {
    almacen.marcarPaso(n, pasos[idx].id);
    const sig = pasos[idx + 1];
    if (sig) ir(n, sig.id); else ir(n);
  }

  function pasoTexto(n, l, pasos, idx) {
    let verPartes = false;
    const panel = h('div', { class: 'glosa', role: 'status', 'aria-live': 'polite', hidden: true });
    const cuerpo = h('div', { class: 'texto-curso', lang: 'eo' });
    const cerrar = () => { panel.hidden = true; };
    const abrir = (d) => {
      panel.replaceChildren(
        h('div', { class: 'glosa-cab' }, h('strong', { lang: 'eo' }, d.texto), h('button', { type: 'button', class: 'enlace', onclick: cerrar }, t('glosa_cerrar'))),
        h('ul', {}, ...d.partes.map((p) => h('li', {}, h('span', { class: `m m-${p.clase}`, lang: 'eo' }, p.m), ' ', p.glosa ? h('span', {}, p.glosa) : h('span', { class: 'mut' }, ETIQUETA_CLASE[p.clase])))));
      panel.hidden = false;
    };
    const pintar = () => {
      cuerpo.replaceChildren(...l.texto.paragrafoj_morfemas.map((par) => h('p', {}, ...par.map((tok) => {
        if (tok === null || tok === undefined) return ' ';
        if (typeof tok === 'string') return tok;
        const d = describirPalabra(tok, l.glosas);
        return h('button', { type: 'button', class: 'pal', onclick: () => abrir(d) },
          verPartes ? d.partes.map((p) => h('span', { class: `m m-${p.clase}` }, p.m)) : d.texto);
      }))));
    };
    pintar();
    const sw = h('input', { type: 'checkbox', id: 'ver-partes', onchange: (e) => { verPartes = e.target.checked; pintar(); } });
    mostrar(cabeceraPaso(n, pasos, idx), h('h2', {}, pasos[idx].titulo), h('p', { class: 'etiqueta' }, l.titulo),
      h('label', { class: 'interruptor', for: 'ver-partes' }, sw, ' ', t('ver_partes')),
      h('p', { class: 'mut' }, t('texto_ayuda')), cuerpo,
      h('audio', { controls: true, preload: 'none', src: `${AUDIO_BASE}${l.id}.mp3` }), h('p', { class: 'mut peq' }, t('audio_curso') + ' · ' + t('texto_curso')),
      panel, barraPasos(n, pasos, idx, { siguienteTxt: t('leido') + ' →', alSiguiente: () => terminarPaso(n, pasos, idx) }));
  }

  function pasoTema(n, l, pasos, idx) {
    const paso = pasos[idx];
    const g = h('div', { class: 'gramatica' });
    const secciones = paso.secciones.map((i) => l.gramatica[i]);
    g.innerHTML = secciones.map((sec, k) => (secciones.length > 1 ? `<h3>${sec.titulo.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</h3>` : '') + mdAHtml(sec.md)).join('\n');
    mostrar(cabeceraPaso(n, pasos, idx), secciones.length > 1 ? h('h2', {}, t('tema_varios')) : h('h2', {}, secciones[0].titulo), g,
      h('section', { class: 'autoeval' }, h('h3', {}, t('autoeval_tit')), h('p', { class: 'mut peq' }, t('autoeval_nota'))),
      barraPasos(n, pasos, idx, { siguienteTxt: t('autoeval_si') + ' →', alSiguiente: () => terminarPaso(n, pasos, idx) }));
  }

  function pasoPractica(n, l, pasos, idx) {
    const vistas = l.cartas.filter((c) => almacen.tarjetas[c.id]);
    const nuevas = l.cartas.filter((c) => !almacen.tarjetas[c.id]).slice(0, 8);
    const fin = () => { almacen.marcarPaso(n, pasos[idx].id); ir(n); };
    const salir = () => ir(n);
    const repasar = () => (vistas.length ? ejecutar({ items: vistas.slice(0, 8), fase: 'fase_repaso', modo: 'repaso', alTerminar: fin, salir }) : fin());
    if (nuevas.length) ejecutar({ items: nuevas, fase: 'fase_nuevo', modo: 'nuevo', alTerminar: repasar, salir });
    else if (vistas.length) repasar();
    else mostrar(h('p', {}, t('practica_vacia')), h('button', { class: 'primario', onclick: fin }, t('siguiente')));
  }

  function pasoPrueba(n, l, pasos, idx) {
    const items = armarPrueba({ cartas, estados: almacen.tarjetas, leccion: n });
    ejecutar({ items, fase: 'fase_prueba', modo: 'prueba', salir: () => ir(n),
      alTerminar: (r) => { almacen.marcarPaso(n, pasos[idx].id); mostrarNota({ resultados: r, lec: n, volver: () => ir(n) }); } });
  }

  function paso(n, id) {
    const l = lecciones[n - 1];
    const pasos = pasosDe(l);
    const idx = pasos.findIndex((p) => p.id === id);
    if (idx < 0) return resumen(n);
    ({ texto: pasoTexto, tema: pasoTema, practica: pasoPractica, prueba: pasoPrueba })[pasos[idx].tipo](n, l, pasos, idx);
  }

  return { resumen, paso };
}
