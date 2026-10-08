// Construye dist/: copia src/ + lecciones/, genera la lista de precache del service worker
// e inyecta MIA_VOJO_API (URL del Worker) en config.js si está definida.
import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';

const raiz = new URL('..', import.meta.url).pathname;
const dist = join(raiz, 'dist');
rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
cpSync(join(raiz, 'src'), dist, { recursive: true });
cpSync(join(raiz, 'lecciones'), join(dist, 'lecciones'), { recursive: true });
for (const f of ['ATRIBUCIONES.md']) cpSync(join(raiz, f), join(dist, f));

if (process.env.MIA_VOJO_API) {
  const p = join(dist, 'config.js');
  writeFileSync(p, readFileSync(p, 'utf8').replace("API_URL = ''", `API_URL = ${JSON.stringify(process.env.MIA_VOJO_API)}`));
}

const listar = (d) => readdirSync(d).flatMap((n) => {
  const p = join(d, n);
  return statSync(p).isDirectory() ? listar(p) : [relative(dist, p)];
});
const archivos = listar(dist).filter((f) => f !== 'sw.js').sort();
const version = createHash('sha1').update(archivos.map((f) => readFileSync(join(dist, f))).join('')).digest('hex').slice(0, 10);
const swp = join(dist, 'sw.js');
writeFileSync(swp, readFileSync(swp, 'utf8').replace('__VERSION__', `mia-vojo-${version}`).replace('__ARCHIVOS__', JSON.stringify(['./', ...archivos])));
console.log(`dist/ listo: ${archivos.length} archivos, versión ${version}`);
