# Licencias y decisiones de interpretación

> No es asesoramiento legal. Lo que depende de interpretar una licencia está marcado como **PREGUNTA ABIERTA**.

Verificado leyendo el repo original (`Esperanto/kurso-zagreba-metodo`, commit `7c10690`, 23-ago-2026): `README.md`, `LICENSE.md`, `PERMESILO.md`, `enhavo/netradukenda/tekstoj/PERMESILO.md`, `AUTHORS.md`, `agordoj/lingvoj.yml`.

| Material | Licencia (según README del original) | Dónde está en este repo |
|---|---|---|
| Textos de lección en esperanto (`enhavo/netradukenda/tekstoj`) | **CC BY-ND 4.0**: deben permanecer sin cambios | `lecciones/NN.json` → `texto` |
| «Todo lo demás» (traducciones, gramática, ejercicios, vocabulario, código del curso) | **CC BY 4.0** | `lecciones/NN.json` → `gramatica_md`, `cartas`, `raices_nuevas` |
| Audio de Emilio Cid (`fonto/sonoj`) | **Sin archivo de licencia propio.** `AUTHORS.md` solo dice «Sono: Emilio Cid». | **No se copia.** Se enlaza desde esperanto12.net |
| ts-fsrs | MIT | `src/vendor/ts-fsrs/` |
| Código de esta app | MIT | todo lo demás |

## Decisiones
1. **Textos en esperanto: solo se muestran, sin cambios.** El importador solo cambia el formato (YAML→JSON), que el propio CC 4.0 trata como «modificación técnica» que no genera obra derivada (sección 2(a)(4)). Se mantiene separado en el campo `texto` con su licencia. Cada pantalla de lección lo rotula «sin cambios, CC BY-ND 4.0».
2. **Tarjetas, cloze y preguntas: derivadas de ejercicios CC BY 4.0** (no de los textos de lección). La tarjeta «frase» usa la frase de ejercicio tal cual (CC BY 4.0, atribución en `ATRIBUCIONES.md`).
3. **Tarjetas que citan frases de los textos de lección:** el importador no las crea. Si se quisieran (p. ej. cloze sobre el texto de la lección) habría que decidir si eso es «adaptación» bajo ND. **PREGUNTA ABIERTA → consultar a los autores** (ver `docs/PROPUESTA_AUTORES.md`).
4. **Audio:** el README dice que lo que no son textos eo va bajo CC BY 4.0, lo que *sugiere* que el audio también, pero no lo afirma para esa carpeta. **PREGUNTA ABIERTA.** Mientras tanto no se re-aloja; la app lo reproduce desde el sitio oficial. La ruta `https://esperanto12.net/assets/mp3/NN.mp3` se dedujo de la plantilla HTML del repo y **no pude comprobarla** (mi red bloqueó el host).
5. **Common Voice (CC0):** no se usa ni se re-aloja (sus condiciones prohíben redistribuir el dataset; ver `docs/INVESTIGACION.md`, «NO VERIFICADO» en el texto exacto).
6. **Tatoeba (CC BY 2.0 FR):** no incluida todavía. Si se añade: atribución al autor de cada oración y filtrado de errores.
7. **No endoso:** la app aclara que no está respaldada por los autores (`ATRIBUCIONES.md`).
8. **Tu código (MIT) y el contenido (CC):** conviven sin mezclarse; el contenido sigue sus licencias aunque el repo sea MIT.
