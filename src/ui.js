// Utilidades de interfaz compartidas (sin lógica de negocio).
import { t } from './i18n.js';
import { aplicarSistemaX } from './normalizar.js';

export const h = (tag, attrs = {}, ...hijos) => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs ?? {})) {
    if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (v === true) el.setAttribute(k, '');
    else if (v !== false && v != null) el.setAttribute(k, v);
  }
  for (const c of hijos.flat()) if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(c));
  return el;
};

export const mostrar = (...nodos) => {
  const m = document.getElementById('principal');
  m.replaceChildren(...nodos.filter((n) => n != null && n !== false));
  m.focus({ preventScroll: true });
  window.scrollTo(0, 0);
};

let ultimoInput = null;
export function campo(attrs = {}) {
  const i = h('input', { type: 'text', autocomplete: 'off', autocapitalize: 'none', autocorrect: 'off', spellcheck: 'false', lang: 'eo', enterkeyhint: 'done', ...attrs });
  i.addEventListener('focus', () => { ultimoInput = i; });
  i.addEventListener('input', () => {
    const antes = i.value, pos = i.selectionStart;
    const despues = aplicarSistemaX(antes);
    if (despues !== antes) { i.value = despues; const p = Math.max(0, pos - (antes.length - despues.length)); i.setSelectionRange(p, p); }
  });
  return i;
}

export function teclado() {
  const insertar = (l) => {
    const i = ultimoInput; if (!i || i.readOnly) return;
    const a = i.selectionStart ?? i.value.length, b = i.selectionEnd ?? a;
    i.value = i.value.slice(0, a) + l + i.value.slice(b);
    i.focus(); i.setSelectionRange(a + 1, a + 1);
    i.dispatchEvent(new Event('input', { bubbles: true }));
  };
  return h('div', { class: 'teclas', role: 'group', 'aria-label': t('teclado_letras') },
    ...['ĉ', 'ĝ', 'ĥ', 'ĵ', 'ŝ', 'ŭ'].map((l) => h('button', { type: 'button', class: 'tecla', 'aria-label': l, lang: 'eo', onmousedown: (e) => e.preventDefault(), onclick: () => insertar(l) }, l)));
}

/** Barra de progreso lineal. */
export const barra = (frac, etiqueta = '') => h('div', { class: 'barra', role: 'img', 'aria-label': `${etiqueta} ${Math.round(frac * 100)}%`.trim() }, h('i', { style: `width:${Math.round(frac * 100)}%` }));

/** Progreso segmentado de una cola (una marca por pregunta). */
export function segmentos(total, actual) {
  return h('div', { class: 'segmentos', role: 'img', 'aria-label': t('pregunta_n', { i: actual + 1, n: total }) },
    ...Array.from({ length: total }, (_, i) => h('i', { class: i < actual ? 'hecho' : i === actual ? 'actual' : '' })));
}

/** Anillo de progreso (CSS conic-gradient). */
export const anillo = (frac, texto) => h('div', { class: 'anillo', style: `--p:${Math.round(frac * 360)}deg`, role: 'img', 'aria-label': `${Math.round(frac * 100)}%` }, h('span', {}, texto));

/** replaceChildren que ignora null/false (para contenido condicional). */
export const poner = (el, ...nodos) => el.replaceChildren(...nodos.filter((n) => n != null && n !== false));
