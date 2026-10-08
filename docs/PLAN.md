# Plan por fases y decisiones

| Fase | Estado | Contenido |
|---|---|---|
| 0 Investigación | Hecha (con huecos) | `docs/INVESTIGACION.md`: fuentes verificadas por búsqueda; lo no verificado está marcado |
| 1 Base legal/contenido | Hecha | `docs/LICENCIAS.md`, `ATRIBUCIONES.md`, `tools/importar.py`, 12 lecciones en `lecciones/` |
| 2 Producto | Núcleo hecho | Sesión diaria, ruta, progreso, pruebas, x-system, teclado, modo oscuro, PWA |
| 3 Implementación | Parcial | Ver «Falta» |

## Decisiones tomadas (y por qué)
- **Contenido desde ejercicios CC BY, no desde los textos ND.** Evita la duda de «adaptación».
- **ts-fsrs 5.4.2 vendorizado** (MIT, sin dependencias): FSRS real y la app sigue siendo estática, sin build de npm.
- **Registro de repasos como fuente de verdad**; el estado FSRS se recalcula (probado: reconstruir == incremental).
- **Primer intento = único que puntúa**; el reescribir tras un fallo no modifica el calendario.
- **Pruebas** no alteran el calendario FSRS; solo alimentan el criterio de dominio.
- **«Casi»** (falta un diacrítico o 1 typo en frase larga) = *Hard*, no *Again*.
- **Dictado** solo si el dispositivo tiene voz `eo`; si no, se avisa y se enlaza el audio oficial.
- **Sincronización opcional**: desactivada hasta definir `MIA_VOJO_API`; mientras tanto exportar/importar.
- **Nombre del repo:** `esperanto-mia-vojo`. No pude renombrar el repo de GitHub (sin herramienta para eso).

## Falta
- Tarjetas de **escucha** (audio→significado) y **raíces/vocabulario** por lección.
- Frases de **Tatoeba** (eo-es) con atribución.
- **Ajuste del vocabulario argentino** (voseo) en la UI ya está; en el contenido del curso no se toca.
- Probar en **móvil real** (iOS/Android), la voz `eo`, la grabación y la PWA offline: **no probado**.
- Probar el Worker contra **Cloudflare real**: solo probado con una D1 simulada.
- Tests de accesibilidad automatizados.
- FSRS con parámetros optimizados (necesita cientos de repasos propios).
