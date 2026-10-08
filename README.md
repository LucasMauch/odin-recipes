# Mia Vojo · Esperanto en 12 lecciones, todo en uno

App web (PWA, sin dependencias de ejecución) para estudiar el curso «Esperanto en 12 lecciones» (método Zagreb, [esperanto12.net](https://esperanto12.net/)): sesión diaria de ~15 min con **repaso → nuevo → hablar → prueba**, programada con **FSRS** ([ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs)), con criterios de dominio por lección.

> No está respaldada por los autores del curso. Créditos y licencias: [ATRIBUCIONES.md](ATRIBUCIONES.md) y [docs/LICENCIAS.md](docs/LICENCIAS.md). Investigación: [docs/INVESTIGACION.md](docs/INVESTIGACION.md). Plan: [docs/PLAN.md](docs/PLAN.md).

## Correrla
```sh
npm run serve        # construye dist/ y sirve en http://localhost:8000
npm test             # 36 tests de JS + 6 de Python (necesita pip install pyyaml)
```
Sin conexión: el service worker solo se registra en https o localhost.

## Regenerar las lecciones
```sh
git clone --depth 1 https://github.com/Esperanto/kurso-zagreba-metodo.git /ruta/original
python3 tools/importar.py /ruta/original      # escribe lecciones/NN.json (12 lecciones)
```
Los textos en esperanto se copian sin cambios (CC BY-ND); las tarjetas salen de los ejercicios (CC BY).

## Estructura
`/lecciones` JSON · `/src` app · `/tools` importador y build · `/tests` · `/worker` sincronización (Cloudflare Worker + D1) · `/docs`

## Desplegar gratis (Cloudflare Pages)
1. Cuenta Cloudflare → *Workers & Pages* → crear proyecto Pages (sin conectar git; lo sube la Action).
2. En GitHub → Settings → Secrets: `CLOUDFLARE_API_TOKEN` (permiso *Pages: Edit*). Variables: `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_PROJECT`.
3. Push a `main` → la Action prueba, construye y publica `dist/`.
4. Alternativa sin Cloudflare: cualquier hosting estático sirve la carpeta `dist/`.

### Sincronización (opcional)
Los límites gratuitos de D1 **fallan** al superarse desde el 1-sep-2026 (ver docs/INVESTIGACION.md). Para activar:
```sh
cd worker && cp wrangler.toml.example wrangler.toml
npx wrangler d1 create mia-vojo          # copiar database_id al toml
npx wrangler d1 execute mia-vojo --remote --file=schema.sql
npx wrangler deploy
```
Luego definir la variable `MIA_VOJO_API` (URL del Worker) en GitHub y volver a desplegar. **El Worker solo se probó con una D1 simulada.**

## Estado honesto
Probado: tests automáticos y una sesión real en Chromium de escritorio (sin errores de consola). **No probado:** móviles reales, voz `eo`, grabación con micrófono, PWA offline instalada, Cloudflare real.
