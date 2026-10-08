// Renderizador mínimo de Markdown (títulos, listas, negrita/cursiva). Escapa todo HTML.
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function inline(s) {
  return esc(s)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*\w])_{1,2}([^_]+)_{1,2}(?=[^*\w]|$)/g, '$1<em>$2</em>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

export function mdAHtml(md) {
  const out = [];
  let lista = null;
  const cerrar = () => { if (lista) { out.push(`</${lista}>`); lista = null; } };
  for (const crudo of md.split(/\r?\n/)) {
    const l = crudo.trimEnd();
    let m;
    if (!l.trim()) { cerrar(); continue; }
    if ((m = l.match(/^(#{1,4})\s+(.*)$/))) {
      cerrar();
      const nivel = Math.min(m[1].length + 1, 5); // h1 de la página ya existe
      out.push(`<h${nivel}>${inline(m[2])}</h${nivel}>`);
    } else if ((m = l.match(/^\s*[-*]\s+(.*)$/))) {
      if (lista !== 'ul') { cerrar(); out.push('<ul>'); lista = 'ul'; }
      out.push(`<li>${inline(m[1])}</li>`);
    } else if ((m = l.match(/^\s*\d+\.\s+(.*)$/))) {
      if (lista !== 'ol') { cerrar(); out.push('<ol>'); lista = 'ol'; }
      out.push(`<li>${inline(m[1])}</li>`);
    } else {
      cerrar();
      out.push(`<p>${inline(l)}</p>`);
    }
  }
  cerrar();
  return out.join('\n');
}
