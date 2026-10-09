// Tarjetas: preguntar, corregir, hablar y mostrar la nota. Una tarea por pantalla.
import { t } from './i18n.js';
import { h, mostrar, campo, teclado, segmentos, poner } from './ui.js';
import { marcarDiferencias } from './normalizar.js';
import { evaluarCarta, aCalificacion, notaPrueba } from './sesion.js';
import { decir, puedeGrabar, crearGrabadora } from './voz.js';
import { AUDIO_BASE } from './config.js';
import { CRITERIOS } from './dominio.js';

let ctx = { almacen: null, voz: () => null };
export const iniciarQuiz = (c) => { ctx = c; };

const nombreFase = { fase_repaso: 'repaso', fase_nuevo: 'nuevo', fase_prueba: 'prueba', fase_hablar: 'hablar' };

function diferencia(correcta, respuesta) {
  return h('span', { lang: 'eo', class: 'dif' }, ...marcarDiferencias(correcta, respuesta).map((x) => (x.mal ? h('mark', {}, x.c) : x.c)));
}

function cabecera(fase, items, i, salir) {
  return h('div', { class: 'cab-quiz' },
    h('button', { type: 'button', class: 'enlace', onclick: salir }, '✕ ' + t('salir')),
    h('span', { class: 'mut' }, t(fase)),
    segmentos(items.length, i));
}

/** modo: 'repaso' | 'nuevo' | 'prueba'. */
export function ejecutar({ items, fase, modo, alTerminar, salir }) {
  let i = 0;
  const resultados = [];
  const voz = ctx.voz();
  const paso = () => {
    if (i >= items.length) return alTerminar(resultados);
    const c = items[i];
    const raiz = h('section', { class: 'quiz', 'data-modo': nombreFase[fase] });

    const preguntar = () => {
      raiz.replaceChildren(cabecera(fase, items, i, salir));
      const inputs = [];
      const cuerpo = h('div', { class: 'enunciado' });
      if (c.tipo === 'dictado') {
        cuerpo.append(h('p', { class: 'consigna' }, t('escribi_dictado')),
          h('button', { type: 'button', class: 'audio-grande', onclick: () => decir(c.eo, voz) }, '🔊 ' + t('escuchar')));
        const inp = campo({ 'aria-label': t('escribi_dictado') }); inputs.push(inp); cuerpo.append(inp);
        setTimeout(() => decir(c.eo, voz), 250);
      } else if (c.tipo === 'cloze') {
        cuerpo.append(h('p', { class: 'consigna' }, t('completa_huecos')), h('p', { class: 'mut es' }, c.es));
        const p = h('p', { class: 'eo-grande', lang: 'eo' });
        for (const trozo of c.plantilla.split(/(\{\d+\})/)) {
          const m = trozo.match(/^\{(\d+)\}$/);
          if (m) { const inp = campo({ class: 'hueco', 'aria-label': `Hueco ${+m[1] + 1}` }); inputs[+m[1]] = inp; p.append(inp); } else p.append(trozo);
        }
        cuerpo.append(p);
      } else {
        cuerpo.append(h('p', { class: 'consigna' }, t('escribi_eo')), h('p', { class: 'es-grande' }, c.es));
        const inp = campo({ 'aria-label': t('escribi_eo') }); inputs.push(inp); cuerpo.append(inp);
      }
      raiz.append(cuerpo, teclado());

      const fb = h('div', { class: 'feedback', 'aria-live': 'assertive' });
      const boton = h('button', { class: 'primario ancho', type: 'button' }, t('comprobar'));
      const acciones = h('div', { class: 'acciones' }, boton);

      const comprobar = () => {
        if (boton.disabled) return;
        const resp = c.tipo === 'cloze' ? inputs.map((x) => x.value) : inputs[0].value;
        const res = evaluarCarta(c, resp);
        resultados.push(res);
        inputs.forEach((x) => { x.readOnly = true; });
        boton.disabled = true;
        if (modo === 'prueba') return avanzar();
        almacen().registrarRepaso(c.id, aCalificacion[res]);
        if (res === 'ok') { poner(fb, h('p', { class: 'res-ok' }, '✔ ' + t('ok'))); return setTimeout(avanzar, 650); }
        const correcta = c.eo;
        const suya = c.tipo === 'cloze' ? inputs.map((x) => x.value).join(' ') : inputs[0].value;
        poner(fb, 
          h('p', { class: res === 'mal' ? 'res-mal' : 'res-casi' }, res === 'casi' ? t('casi') : t('mal')),
          h('p', { class: 'etiqueta' }, t('correcto')), h('p', { class: 'eo-grande', lang: 'eo' }, diferencia(correcta, suya)),
          voz ? h('button', { type: 'button', class: 'secundario', onclick: () => decir(c.eo, voz) }, '🔊 ' + t('escuchar')) : null,
          h('p', { class: 'consigna' }, t('reescribi')));
        const re = campo({ 'aria-label': t('reescribi') });
        const ok = h('button', { class: 'primario ancho', type: 'button', disabled: true, onclick: avanzar }, t('siguiente'));
        re.addEventListener('input', () => { ok.disabled = evaluarCarta({ ...c, tipo: 'palabra' }, re.value) !== 'ok'; });
        re.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !ok.disabled) ok.click(); });
        fb.append(re, ok);
        acciones.hidden = true;
        re.focus();
      };
      boton.addEventListener('click', comprobar);
      cuerpo.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); comprobar(); } });
      raiz.append(acciones, fb);
      inputs[0]?.focus();
    };
    const avanzar = () => { i++; paso(); };

    if (modo === 'nuevo') {
      raiz.append(cabecera(fase, items, i, salir),
        h('div', { class: 'enunciado' }, h('p', { class: 'consigna' }, t('memoriza')), h('p', { class: 'es-grande' }, c.es), h('p', { class: 'eo-grande', lang: 'eo' }, c.eo),
          voz ? h('button', { type: 'button', class: 'secundario', onclick: () => decir(c.eo, voz) }, '🔊 ' + t('escuchar')) : null),
        h('div', { class: 'acciones' }, h('button', { class: 'primario ancho', type: 'button', onclick: preguntar }, t('tapar'))));
    } else preguntar();
    mostrar(raiz);
  };
  paso();
}
const almacen = () => ctx.almacen;

export function hablar(items, { alTerminar, salir }) {
  let i = 0;
  const voz = ctx.voz();
  const paso = () => {
    if (i >= items.length) return alTerminar();
    const c = items[i];
    const caja = h('section', { class: 'quiz' }, cabecera('fase_hablar', items, i, salir),
      h('div', { class: 'enunciado' }, h('p', { class: 'consigna' }, t('habla_paso1')), h('p', { class: 'mut es' }, c.es), h('p', { class: 'eo-grande', lang: 'eo' }, c.eo)));
    if (voz) caja.append(h('button', { type: 'button', class: 'audio-grande', onclick: () => decir(c.eo, voz) }, '🔊 ' + t('escuchar')));
    else caja.append(h('p', { class: 'aviso' }, t('sin_voz')), h('audio', { controls: true, preload: 'none', src: `${AUDIO_BASE}${String(c.lec).padStart(2, '0')}.mp3` }), h('p', { class: 'mut' }, t('audio_curso')));
    const zona = h('div');
    if (puedeGrabar()) {
      let grab = null;
      const b = h('button', { type: 'button', class: 'secundario' }, '⏺ ' + t('grabar'));
      b.addEventListener('click', async () => {
        try {
          if (!grab) { grab = await crearGrabadora(); grab.empezar(); b.textContent = '⏹ ' + t('parar'); return; }
          const url = await grab.parar(); grab = null; b.textContent = '⏺ ' + t('grabar');
          zona.replaceChildren(h('p', { class: 'mut' }, t('tu_grabacion')), h('audio', { controls: true, src: url }));
        } catch { zona.replaceChildren(h('p', { class: 'res-mal' }, t('sin_microfono'))); }
      });
      caja.append(b, zona);
    } else caja.append(h('p', { class: 'mut' }, t('sin_microfono')));
    caja.append(h('p', { class: 'consigna' }, t('como_te_sono')), h('div', { class: 'caras' }, ...[['😕', 1, 'Lejos'], ['🙂', 2, 'Regular'], ['😀', 3, 'Bien'], ['🎯', 4, 'Igual']].map(([e, n, tx]) =>
      h('button', { type: 'button', class: 'secundario', 'aria-label': `${tx} (${n}/4)`, onclick: () => { almacen().registrarHabla({ carta: c.id, auto: n }); i++; paso(); } }, e))));
    mostrar(caja);
  };
  paso();
}

export function mostrarNota({ resultados, lec, volver }) {
  const nota = notaPrueba(resultados);
  almacen().registrarPrueba({ lec, nota, n: resultados.length });
  const bien = nota >= CRITERIOS.notaMin;
  mostrar(h('section', { class: 'quiz centro' }, h('p', { class: 'etiqueta' }, t('tu_nota')), h('p', { class: `nota ${bien ? 'res-ok' : 'res-casi'}` }, `${nota}`, h('small', {}, '/100')),
    h('p', {}, bien ? t('nota_aprobada') : t('nota_mejorar')), h('button', { class: 'primario ancho', onclick: volver }, t('siguiente'))));
}
