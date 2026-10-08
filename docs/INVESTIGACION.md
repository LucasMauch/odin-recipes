# Investigación: app web para aprender esperanto (hispanohablante argentino, principiante)

Fecha: 2026-10-08. Base: curso «Esperanto en 12 lecciones» (esperanto12.net, método Zagreb).

**Nota de método (leer primero).** El proxy de red bloqueó `developers.cloudflare.com`, `tatoeba.org` y `commonvoice.mozilla.org` para lectura directa. Se pudo leer directamente: registro npm de `ts-fsrs`, README de `srs-benchmark`, README del repo del curso. Todo lo demás (papers, Cloudflare, Tatoeba, Common Voice, KER, etc.) se verificó **a través de resultados de WebSearch** (que citan abstracts, páginas oficiales y espejos), no leyendo la página primaria. Por eso cada ítem lleva una etiqueta de verificación:

- **[V-directa]** leído en la fuente primaria.
- **[V-búsqueda]** confirmado por resultados de búsqueda que citan la fuente (bibliografía/abstract); conviene un chequeo humano antes de citar cifras.
- **NO VERIFICADO** no se pudo confirmar.

Fuerza de evidencia: **[MA]** meta-análisis/revisión sistemática; **[EI]** estudio(s) individual(es); **[OP]** opinión/práctica común.

---

## Resumen ejecutivo (decisiones de diseño)

1. **Núcleo = práctica de recuperación + repaso espaciado.** Son los efectos con mejor respaldo [MA] (Rowland 2014; Adesope 2017; Cepeda 2006; Kim & Webb 2022 en L2). Cada lección termina en tarjetas que exigen *recordar*, no releer.
2. **Programador: `ts-fsrs` 5.4.2 (MIT), FSRS con parámetros por defecto y retención objetivo 0,9.** Sin optimizar parámetros hasta tener cientos de repasos propios. SM-2 queda solo como respaldo conceptual.
3. **Producción sobre reconocimiento:** tarjetas de escribir/completar (cloze) y dictado, con feedback inmediato. Generation effect es [MA] (Bertsch 2007) pero en listas de palabras; el salto a "produce mejor L2" es inferencia propia.
4. **Feedback correctivo con reescritura** para ejercicios de escritura: [MA] con efecto pequeño-moderado (Kang & Han 2015).
5. **Intercalado solo en el repaso final de la lección** (mezclar terminaciones -o/-a/-e, -as/-is/-os). Aplicabilidad a idiomas es extrapolación (NO hay meta-análisis L2 verificado).
6. **Shadowing y lectura extensiva como actividades opcionales**: shadowing es [EI] (sin meta-análisis hallado); lectura extensiva tiene [MA] pero con críticas.
7. **No tratar a Krashen como hecho**: es hipótesis debatida; el input se ofrece (textos del curso) pero no es el único canal.
8. **Contenido:** textos del curso (CC BY-ND 4.0, sin modificar) + oraciones Tatoeba eo-es (CC BY 2.0 FR, con atribución).
9. **Audio:** no depender de la voz TTS `eo` (disponibilidad NO VERIFICADA por dispositivo). Priorizar las grabaciones de Emilio Cid del repo (licencia ambigua: pregunta abierta). **No re-alojar Common Voice.** Grabación propia con MediaRecorder, solo local.
10. **Hosting gratuito Cloudflare es viable pero con tope duro:** desde 2026-09-01, D1 Free **falla** al pasar 5 M filas leídas o 100 k escritas por día. Diseñar con índices, caché local y escrituras agrupadas.
11. **Evaluación:** rúbrica «puedo hacer» A1 por lección + criterio de dominio medible (propuesta propia, **no validada**). Los exámenes UEA-KER parten de B1: la app no puede certificar nivel.

---

## 1. Evidencia sobre aprendizaje de L2

### 1.1 Práctica de recuperación (testing effect)
- Rowland, C. A. (2014). *The effect of testing versus restudy on retention: A meta-analytic review of the testing effect.* Psychological Bulletin, 140(6), 1432–1463. doi:10.1037/a0037559. [MA] [V-búsqueda]. Efecto mayor con feedback, recuperación con pista (cued recall) y retención más larga (según resúmenes; texto completo no leído). En L2 específico: NO VERIFICADO.
- Adesope, O. O., Trevisan, D. A., & Sundararajan, N. (2017). *Rethinking the use of tests: A meta-analysis of practice testing.* Review of Educational Research, 87(3), 659–701. doi:10.3102/0034654316689306. [MA] [V-búsqueda]. Pruebas de práctica superan a re-estudiar; el feedback amplifica. Número de estudios: fuentes discrepan (118 vs 217): NO VERIFICADO.

### 1.2 Repaso espaciado
- Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., & Rohrer, D. (2006). *Distributed practice in verbal recall tasks: A review and quantitative synthesis.* Psychological Bulletin, 132(3), 354–380. doi:10.1037/0033-2909.132.3.354. PubMed 16719566. [MA] [V-búsqueda]. Abstract: 839 evaluaciones, 317 experimentos, 184 artículos; el intervalo óptimo entre sesiones crece con el intervalo de retención.
- Kim, S. K., & Webb, S. (2022). *The effects of spaced practice on second language learning: A meta-analysis.* Language Learning, 72(1), 269–319. doi:10.1111/lang.12479. [MA en L2] [V-búsqueda, vía bibliografía y la reseña de Serrano 2022]. Serrano (2022) la resume: 37 estudios, beneficio general del espaciado con tamaño variable según tipo de área L2, aprendiz y actividad; subgrupos con pocos estudios. Cifras exactas: NO VERIFICADO.

### 1.3 Intercalado (interleaving)
- Brunmair, M., & Richter, T. (2019). *Similarity matters: A meta-analysis of interleaved learning and its moderators.* Psychological Bulletin. doi:10.1037/bul0000209. [MA] [V-búsqueda]. 59 estudios, 238 tamaños de efecto, g = 0,42 global; mayor con material visual (pinturas, g = 0,67); gran heterogeneidad; ayuda más cuando las categorías son similares y difíciles de discriminar. Resultado para materiales lingüísticos/L2: NO VERIFICADO. **Aplicabilidad a idiomas = extrapolación.**

### 1.4 Producción vs. reconocimiento
- Bertsch, S., Pesta, B. J., Wiscott, R., & McDaniel, M. A. (2007). *The generation effect: A meta-analytic review.* Memory & Cognition, 35(2), 201–210. doi:10.3758/BF03193441. PubMed 17645161. [MA] [V-búsqueda]. 86 estudios, 445 tamaños de efecto, efecto medio ≈ 0,40. Es sobre generar vs. leer (listas/palabras), no sobre aprendizaje de L2 en sí.
- Swain (output hypothesis, 1985): [OP/teoría con evidencia mixta]. Una crítica de 2020 señala falta de definición operativa de "output comprensible" (fuente secundaria, solo abstract: *A Critique of Merrill Swain's Output Hypothesis in Language Learning and Teaching*, acikerisim.comu.edu.tr). No se halló meta-análisis. Tratar con cautela.

### 1.5 Corrección con reescritura / feedback
- Kang, E., & Han, Z. (2015). *The efficacy of written corrective feedback in improving L2 written accuracy: A meta-analysis.* The Modern Language Journal, 99(1), 1–18. [MA] [V-búsqueda]. 21 estudios primarios; efecto pequeño a moderado según resúmenes secundarios; mejor con aprendices intermedios/avanzados; con bajo nivel la corrección directa podría superar a la indirecta (sin verificar en el texto).
- Brown, D. (2016). *The type and linguistic foci of oral corrective feedback in the L2 classroom: A meta-analysis.* Language Teaching Research, 20(4), 436–458. doi:10.1177/1362168814563200. [V-búsqueda]. **Cuidado:** describe qué tipos de feedback dan los docentes (recasts ≈ 57 %, prompts ≈ 30 %), **no** mide eficacia. No usar como respaldo de eficacia. (Para eficacia oral habría que buscar otro meta-análisis; NO VERIFICADO.)

### 1.6 Input comprensible / lectura extensiva
- Krashen (1985, *The Input Hypothesis*): **hipótesis debatida.** Críticas habituales: término "comprensible" poco operacionalizable, subestima output e instrucción explícita (fuentes secundarias; las atribuciones a Brown 2000 y McLaughlin 1987 son de segunda mano: NO VERIFICADO en originales). Una afirmación de "500+ estudios que la validan" en un sitio comercial: no usada.
- Nakanishi, T. (2015). *A meta-analysis of extensive reading research.* (TESOL Quarterly; la revista/páginas no fueron confirmadas: NO VERIFICADO). [MA] [V-búsqueda]: 34 estudios, 3 942 participantes, d = 0,46 (grupos) y 0,71 (pre-post).
- Jeon, E.-Y., & Day, R. R. (2016). *The effectiveness of ER on reading proficiency: A meta-analysis.* Reading in a Foreign Language, 28(2), 246–265. [MA] [V-búsqueda]. 49 estudios primarios, 71 muestras, 5 919 participantes; efecto pequeño a medio; críticas a Nakanishi por incluir estudios que no reflejan lectura extensiva. Ojo: esos meta-análisis son sobre inglés L2, no esperanto.

### 1.7 Shadowing
- Hamada, Y. (2016). Language Teaching Research (título exacto NO VERIFICADO): shadowing más eficaz en nivel bajo que alto en pruebas de listening. [EI] [V-búsqueda].
- Hamada, Y. (2019). *Shadowing: What is it? How to use it. Where will it go?* RELC Journal. doi:10.1177/0033688218771380. Revisión narrativa. Kadota, S. (2019), *Shadowing as a Practice in Second Language Acquisition* (Routledge): monografía.
- No se halló meta-análisis; estudios pequeños, mayoría en Japón e inglés L2. **Fuerza: estudios individuales.**

### 1.8 Dictado y cloze
- Dictado: estudios pequeños y mixtos (p. ej. Rahimi 2008, Asian EFL Journal; estudio Kindai Univ. con 18 y 16 aprendices). [EI] débil [V-búsqueda]. Sin meta-análisis hallado.
- Cloze: abundante evidencia como **test** de proficiencia (validez), poca como método de **enseñanza**. [OP/EI]. Clozemaster usa el formato, pero eso es práctica común, no prueba de eficacia.

### 1.9 Cuadro: efecto, fuerza de evidencia y aplicación en la app

| Efecto | Fuerza de evidencia | Cómo lo aplica la app |
|---|---|---|
| Práctica de recuperación | [MA] Rowland 2014; Adesope 2017 (no específico de L2) | Tarjetas que piden recordar (eo→es y es→eo), sin mostrar la respuesta antes |
| Repaso espaciado | [MA] Cepeda 2006; [MA L2] Kim & Webb 2022 | FSRS con retención 0,9 |
| Feedback tras el intento | [MA] (moderador en Rowland/Adesope) | Mostrar respuesta correcta y diferencia con lo escrito inmediatamente |
| Generación/producción | [MA] Bertsch 2007 (listas); output hypothesis: debatida | Escribir la respuesta y completar huecos; dictado |
| Feedback correctivo escrito + reescritura | [MA] Kang & Han 2015 (pequeño-moderado) | Marcar error, pedir reescribir antes de continuar |
| Intercalado | [MA] Brunmair & Richter 2019; **L2 no verificado** | Mezclar tipos de tarjeta solo en el repaso final de lección |
| Lectura extensiva | [MA] Nakanishi, Jeon & Day (inglés L2) | Lecturas graduadas opcionales (textos del curso, Vikipedio simple) |
| Input comprensible (Krashen) | Hipótesis debatida | Audio+texto del curso como complemento, no como única vía |
| Shadowing | [EI] (Hamada) | Actividad opcional: escuchar y repetir con grabación local |
| Dictado | [EI] débil | Ejercicio de escuchar y escribir (audio de Emilio Cid o TTS) |
| Cloze | Validez como test; eficacia didáctica no establecida | Tarjetas con hueco sobre oraciones Tatoeba (práctica común, [OP]) |

---

## 2. Algoritmos de repaso

### 2.1 ts-fsrs [V-directa, registro npm]
| Dato | Valor |
|---|---|
| Versión actual | **5.4.2** (npm `latest`, consultado 2026-10-08) |
| Licencia | **MIT** |
| Tamaño | unpackedSize 706 415 B (≈ 690 KiB, incluye mapas/typings/builds; tamaño minificado/gzip NO VERIFICADO, revisar bundlephobia) |
| Dependencias runtime | ninguna listada |
| Node | >= 20 |
| Formatos | ESM, CJS, UMD, tipos `.d.ts` |
| Repo | github.com/open-spaced-repetition/ts-fsrs (monorepo, `packages/fsrs`) |

API (README 5.4.1 vía jsDelivr [V-búsqueda]; la API cambió entre versiones, verificar con la 5.4.2): `fsrs(params)`, `createEmptyCard()`, `Rating` (Again/Hard/Good/Easy), `scheduler.repeat(card, now)` (vista previa de los 4 resultados) y `scheduler.next(card, now, rating)` (devuelve `card` y `log`). Parámetros: `request_retention` (0,9 por defecto), `maximum_interval`, `enable_fuzz`, `enable_short_term`, `learning_steps`, `relearning_steps`.

### 2.2 FSRS vs. SM-2
- SM-2 (Wozniak, SuperMemo): intervalos fijos 1 y 6 días, luego intervalo previo × E-Factor (inicial 2,5; piso 1,3 en descripciones posteriores; el original menciona 1,1). Calificación 0–5. [V-búsqueda, supermemo.com archivos].
- FSRS-6: 21 parámetros; valores iniciales ajustados con datos masivos; el optimizador personaliza con el historial propio. Retención objetivo por defecto 90 %. [V-búsqueda: domenic.me/fsrs, wiki open-spaced-repetition]. Subir de 90 % a 97 % triplicaría repasos (estimación de RemNote; fuente comercial).
- **Benchmark** (open-spaced-repetition/srs-benchmark README [V-directa]): 10 000 usuarios de Anki, ~727 M repasos; métricas Log Loss, RMSE(bins), AUC con partición temporal. Sin repasos del mismo día: FSRS-6 LogLoss 0,3460 / RMSE 0,0653 / AUC 0,7034; FSRS-5 0,3561 / 0,0742 / 0,7010; FSRS-4.5 0,3625 / 0,0764 / 0,6891. **El README no informa resultados de SM-2** (solo remite a repos de comparación con SM-15/17 sin números). Una afirmación "FSRS supera a SM-2 en este benchmark" por tanto **NO VERIFICADO** desde esta fuente. Es benchmark del propio proyecto (autoinformado), con usuarios de Anki, no de esperanto.
- El README lista parámetros por defecto solo para FSRS-7; no da resultados con parámetros por defecto de FSRS-6. Desempeño con parámetros por defecto en usuario nuevo: NO VERIFICADO.

### 2.3 Recomendación para este caso (usuario único, pocos datos)
- **Usar ts-fsrs con parámetros por defecto y `request_retention = 0.9`.** Motivos: (a) no requiere historial para empezar (los defaults vienen de un ajuste poblacional); (b) licencia MIT, sin dependencias, corre en el navegador, sin servidor; (c) programa por probabilidad de recuerdo y no por factor fijo, con retención objetivo explícita; (d) SM-2 no tiene modelo de recuerdo explícito (propia valoración).
- No optimizar parámetros hasta acumular volumen propio (umbral exacto recomendado: NO VERIFICADO; en Anki se suele citar del orden de cientos de repasos, **opinión/práctica común**).
- Guardar siempre el `log` de cada repaso: permite re-optimizar después y calcular métricas de dominio (sección 4).
- `enable_fuzz: true` para evitar acumulación de tarjetas el mismo día (práctica común).
- Riesgo: es un solo usuario, así que ningún benchmark poblacional garantiza buen ajuste individual.

---

## 3. Cómo se aprende esperanto en la práctica

Todo aquí es **[OP]/descripción de producto**; verificado solo vía búsqueda (los sitios no se abrieron directamente).

| Recurso | Qué hace bien | Qué le falta / reservas |
|---|---|---|
| Lernu.net | Gratuito, multilingüe, desde 2002; cursos (p. ej. Ana Pana) y diccionario a >40 idiomas; cubre A1–B1 según una guía | Estado actual de mantenimiento NO VERIFICADO; no es repaso espaciado propio |
| Duolingo (eo desde español) | Gamificación; hubo curso desde español | Sin actualización mayor desde 2018 y ~2 000 raíces, según blog de Clozemaster (competidor); una petición decía que los cursos sobre español estaban ocultos y por cerrarse (sin fecha). **Disponibilidad actual NO VERIFICADA** |
| Clozemaster | Cloze en contexto; oraciones de Tatoeba | Mejor para nivel algo más avanzado; modelo comercial |
| Amikumu | Encontrar hablantes cercanos | Detalles no verificados |
| Radio Verda | Podcasts de habla natural | Un sitio dice que ya no se actualiza; otro lo recomienda: estado NO VERIFICADO |
| Curso esperanto12.net | Método Zagreb, 12 lecciones, repositorio abierto | Es curso lineal; el README dice que se puede usar libremente con crédito |
| Tatoeba | Corpus de oraciones con traducciones | Calidad heterogénea (contribuciones voluntarias) |
| Vikipedio, Ipernity | Lectura/comunidad | No evaluados en detalle: NO VERIFICADO |

**Hueco para la app:** repaso espaciado integrado a *este* curso, en español rioplatense, con producción escrita y criterios de dominio por lección.

### Tatoeba
- Licencia de los archivos de descarga: **CC BY 2.0 FR**; algunas oraciones también CC0 1.0; las licencias de audio las fija cada contribuyente [V-búsqueda sobre tatoeba.org/downloads]. Atribución obligatoria.
- Descarga: página de descargas, exportaciones semanales (sábados 6:30 UTC), con filtro por idioma y herramienta de "pares de oraciones" que exporta un idioma con sus traducciones a otro. Para eo→es: pares *epo–spa* desde esa herramienta (o `sentences.tar.bz2` + `links.tar.bz2` y filtrar localmente). URL exacta de la herramienta: NO VERIFICADO.
- **Tamaño de oraciones en esperanto: NO VERIFICADO** (no pude abrir tatoeba.org). Consultar `tatoeba.org/es/stats/sentences_by_language`. Cantidad de pares eo–es: NO VERIFICADO.
- Mirrors en Hugging Face listan "licencia desconocida": usar la fuente oficial.

---

## 4. Evaluación del progreso

### 4.1 Exámenes oficiales
- UEA-KER (marco KER = MCER en esperanto): niveles **B1, B2, C1**, y C2 (agregado 2022). **Confirmado: parten de B1; no hay KER oficial para A1/A2.** [V-búsqueda]. Escritos de 2, 3, 4 y 3,5 h (B1, B2, C1, C2); parte oral con comisión y comprensión auditiva. Organización: UEA con Edukado.net (UEA «Centro de exámenes KER»). **El papel de ITK NO VERIFICADO** (solo aparecen exámenes de muestra alojados en un dominio itk.hu).
- Existe un examen «Unua nivelo» de ILEI, no KER, que apunta aprox. a A1/A2 (según un resultado de búsqueda; **NO VERIFICADO** su vigencia).
- Consecuencia: la app **no certifica**; solo da autoevaluación formativa.

### 4.2 MCER Companion Volume
- Council of Europe (2020). *Common European Framework of Reference for Languages: Companion Volume.* Incluye mejor descripción de A1 y formaliza Pre-A1 [V-búsqueda]. URL: https://rm.coe.int/cefr-companion-volume-with-new-descriptors-2018/1680787989. **No pude leer los descriptores literales de A1**; la rúbrica de abajo está *alineada en espíritu* con A1 (frases simples, presentarse, preguntar y responder sobre datos personales) pero **no cita textualmente**. Pendiente: contrastar con las escalas «Overall oral production», «Listening» y «Reading» del documento.

### 4.3 Rúbrica «puedo hacer» (PROPUESTA PROPIA, NO VALIDADA)
Temas de lección: asignaciones tentativas basadas en el método Zagreb general; **revisar contra el índice real de esperanto12.net** (no verificado aquí).

| Lección | Puedo… (A1) |
|---|---|
| 1 | Saludar y presentarme; entender y decir frases con *estas / ne estas* |
| 2 | Nombrar objetos y personas; usar el artículo *la* y el plural -j |
| 3 | Preguntar con *ĉu*, *kio*, *kiu* y responder sí/no |
| 4 | Describir con adjetivos (-a) y concordar en número |
| 5 | Usar el acusativo -n para decir qué hago/qué quiero |
| 6 | Hablar de acciones habituales (-as) y rutinas |
| 7 | Hablar del pasado (-is) con frases simples |
| 8 | Hablar del futuro (-os) y de intenciones |
| 9 | Usar correlativos básicos (tie, tio, kiam…) |
| 10 | Formar palabras con prefijos/sufijos frecuentes (mal-, -ej-, -ist-) |
| 11 | Expresar deseos y pedidos (-us, -u) con cortesía |
| 12 | Leer un texto corto y contar algo sobre mí o mi día en 5–8 oraciones |

### 4.4 Criterios de dominio (PROPUESTA PROPIA, NO VALIDADA)
Una lección se marca «dominada» si:
1. ≥ 85 % de sus tarjetas con estabilidad FSRS ≥ 14 días (umbral arbitrario; ajustar con datos reales).
2. Nota ≥ 90 % en un test de producción (escribir/completar) sin ayuda, con ítems no vistos en las tarjetas.
3. Autoevaluación «puedo hacer» con ítems marcados y evidencia (una producción escrita guardada).
4. Revisión a los 7 y 30 días: si la retención efectiva cae < 80 % la lección vuelve a «en repaso».

Ninguno de estos números proviene de la literatura; sirven para empezar a medir y se deben recalibrar.

---

## 5. Audio y voz

### 5.1 Web Speech API (síntesis)
- Chrome, Android, iOS, Windows, macOS: **no se pudo confirmar ninguna voz `eo` nativa** [V-búsqueda]. Qué se sabe: Safari/iOS solo expone un conjunto fijo de voces preinstaladas, a veces con voces ausentes del listado; `speak()` en iOS debe ocurrir dentro de un gesto del usuario. eSpeak NG soporta esperanto (según fuente antigua sobre eSpeak; vigencia de la versión actual: NO VERIFICADO), pero que Chrome/Android lo exponga depende del motor TTS instalado.
- Disponibilidad `eo` por dispositivo: **NO VERIFICADO**. Recomendación: detectar con `speechSynthesis.getVoices().some(v => v.lang.startsWith('eo'))`, y si no hay, ocultar el botón y usar audio pregrabado.
- Servicio comercial ResponsiveVoice ofrece voz de esperanto (página del proveedor); implica servidor/licencia de terceros, no recomendado de entrada.

### 5.2 Common Voice (esperanto)
- Datasets Esperanto (Scripted Speech 23.0; Spontaneous Speech 3.0) con licencia **CC0-1.0** [V-búsqueda sobre las fichas de datacollective.mozillafoundation.org]. La ficha de Spontaneous Speech 3.0 (esperanto) incluye, según el resumen, la prohibición de **intentar determinar la identidad de los hablantes** y de **re-alojar o re-compartir** el dataset. En la ficha de Scripted Speech 23.0 el texto recuperado no incluía sección de restricciones (autogenerada): **NO VERIFICADO**. No pude leer los *Términos* oficiales.
- Decisión de diseño: **no re-alojar ningún clip de Common Voice**; no indexar ni exponer identificadores de hablantes. Como mucho, enlazar a la fuente.

### 5.3 Grabaciones de Emilio Cid (repo Esperanto/kurso-zagreba-metodo)
- Hecho ya verificado por el solicitante: sin archivo de licencia específico en `fonto/sonoj`; el README lo no-textual va bajo CC BY 4.0; AUTHORS.md acredita «Sono: Emilio Cid».
- Matiz leído hoy en el README [V-directa]: los **textos esperantaj** de `enhavo/netradukenda/tekstoj` **deben permanecer sin cambios** y quedan bajo **CC BY-ND 4.0**; «todo lo demás» se puede cambiar (CC BY 4.0). Fuente: https://raw.githubusercontent.com/Esperanto/kurso-zagreba-metodo/master/README.md.
- **Pregunta abierta (sin resolver):** ¿el audio está cubierto por «todo lo demás = CC BY 4.0» o es un tipo de contenido distinto? ¿Una transcripción en la app contaría como modificación del texto ND? Sugerencia: preguntar a los mantenedores (issue en el repo) antes de redistribuir.
- Una búsqueda web sobre Emilio Cid no devolvió información adicional (NO VERIFICADO).

### 5.4 Otras fuentes de audio
| Fuente | Qué se puede/no re-alojar |
|---|---|
| Radio Verda | Licencia de los podcasts NO VERIFICADA → solo enlazar |
| Wikimedia Commons / Vikipedio | Licencias por archivo; hay que revisarlas una por una: NO VERIFICADO; enlazar o re-alojar solo con licencia compatible y atribución |
| Lernu | Términos NO VERIFICADOS → solo enlazar |
| Tatoeba (audio) | La licencia la fija cada contribuyente (según su página de descargas) → revisar por oración |

### 5.5 Grabación local (MediaRecorder)
- Requiere contexto seguro (HTTPS o localhost) y permiso de micrófono [V-búsqueda, MDN getUserMedia].
- Formatos: Chrome `audio/webm;codecs=opus`; Firefox Ogg/Opus (WebM desde Firefox 63); Safari graba `audio/mp4` (AAC), y desde 18.4 también WebM/Opus según addpipe [V-búsqueda, fuente de terceros]. Usar `MediaRecorder.isTypeSupported()` para elegir.
- Privacidad: guardar en IndexedDB/memoria; no subir al servidor (decisión de diseño propuesta).

---

## 6. Hosting (Cloudflare, plan gratuito)

**Advertencia:** `developers.cloudflare.com` estaba bloqueado. Todo se verificó por resultados de WebSearch que citan las páginas oficiales. Revisar manualmente antes de depender de las cifras.

### 6.1 Cambio del 1/9/2026: **CONFIRMADO [V-búsqueda]**
- Entrada del changelog oficial: «D1 enforces free tier daily query limits», URL https://developers.cloudflare.com/changelog/post/2026-09-01-d1-free-tier-limit-enforcement/ (fecha 2026-09-01).
- Contenido (parafraseado de los resultados, **no cita literal verificada**): desde el 1 de septiembre de 2026, las consultas D1 en el plan Workers Free **fallan** cuando la cuenta supera el límite diario de filas leídas o escritas; las consultas por Workers Binding API y REST API devuelven errores hasta el reinicio a las 00:00 UTC; los datos almacenados no se afectan; se envían alertas por correo.
- Mensajes de error (inicio, según el resumen): «Your account has exceeded D1's free tier daily row read limit.» y «...row write limit.», seguidos de la indicación de pasar a plan pago o esperar hasta el día siguiente (medianoche UTC). Texto exacto completo: **NO VERIFICADO**.
- Discrepancia: una nota de versión antigua de D1 decía que la aplicación de límites comenzaría el 2025-02-10; se considera vigente la entrada de 2026.

### 6.2 Límites gratuitos (según resultados de búsqueda)
| Servicio | Límite Free | Estado |
|---|---|---|
| D1 | 5 M filas leídas/día; 100 k filas escritas/día | [V-búsqueda] (pricing) |
| D1 | 5 GB de almacenamiento total; 500 MB por base; 10 bases por cuenta | [V-búsqueda] (limits, coinciden varios espejos) |
| D1 | Las lecturas cuentan filas *escaneadas*, no devueltas (full scan de 5 000 filas = 5 000 leídas) | [V-búsqueda] |
| Workers | 100 000 solicitudes/día (reinicio 00:00 UTC), 1 000 solicitudes/min de ráfaga, 10 ms de CPU por solicitud, 128 MB de memoria | [V-búsqueda] |
| Workers | 50 subrequests por invocación | **NO VERIFICADO** (solo un blog) |
| Pages | 500 builds/mes (alcance cuenta vs. proyecto: NO VERIFICADO), 1 build simultáneo, timeout 20 min | [V-búsqueda] |
| Pages | 20 000 archivos por sitio, 25 MiB por archivo | [V-búsqueda] |
| Pages Functions | Consumen la cuota de Workers | [V-búsqueda] |

Implicancias de diseño: guardar el progreso en el navegador (IndexedDB) y sincronizar a D1 por lotes; índices en toda consulta; una sola escritura agregada por sesión; los assets estáticos (audio propio) no pasan por D1.

---

## Preguntas abiertas / NO VERIFICADO

1. Licencia efectiva del audio de Emilio Cid (¿CC BY 4.0?; ¿ND aplica a derivados de los textos?).
2. Existencia de voz `eo` en Web Speech por navegador/OS (todo dependiente del dispositivo).
3. Texto literal completo del changelog D1 del 2026-09-01 y de las páginas de pricing/limits (acceso bloqueado).
4. Número de oraciones Tatoeba en esperanto y de pares eo–es; URL exacta de la herramienta de pares.
5. Términos de Common Voice: restricciones literales (re-alojar, re-identificar) en los *Terms*; ficha Scripted 23.0.
6. Descriptores literales A1 del Companion Volume; contraste con el índice real de las 12 lecciones.
7. Resultados de SM-2 en srs-benchmark; desempeño de FSRS con parámetros por defecto en usuario nuevo; umbral de repasos para optimizar.
8. Meta-análisis L2 de intercalado, shadowing, dictado y cloze (no hallados); cifra de estudios en Adesope 2017; revista de Nakanishi 2015; eficacia (no frecuencia) del feedback oral.
9. Rol de ITK en los exámenes KER; vigencia de «Unua nivelo».
10. Estado actual de Duolingo eo→es, Radio Verda, Lernu, Amikumu; licencias de audio de Radio Verda, Lernu y Commons.
11. Subrequests de Workers Free; alcance de los 500 builds de Pages.
12. Tamaño minificado/gzip de ts-fsrs.

---

## Fuentes

**Papers**
- Rowland, C. A. (2014). Psychological Bulletin, 140(6), 1432–1463. doi:10.1037/a0037559
- Adesope, Trevisan & Sundararajan (2017). Review of Educational Research, 87(3), 659–701. doi:10.3102/0034654316689306
- Cepeda, Pashler, Vul, Wixted & Rohrer (2006). Psychological Bulletin, 132(3), 354–380. https://pubmed.ncbi.nlm.nih.gov/16719566/
- Kim & Webb (2022). Language Learning, 72(1), 269–319. doi:10.1111/lang.12479; reseña: Serrano (2022), SSLLT, https://diposit.ub.edu/server/api/core/bitstreams/911f8da8-9666-4917-9411-c9ae6754cd7b/content
- Brunmair & Richter (2019). Psychological Bulletin. doi:10.1037/bul0000209. Manuscrito: https://www.psychologie.uni-wuerzburg.de/fileadmin/06020400/2019/Brunmair_Richter_in_press__2019_META-ANALYSIS_OF_INTERLEAVED_LEARNING.pdf
- Bertsch et al. (2007). Memory & Cognition, 35(2), 201–210. https://pubmed.ncbi.nlm.nih.gov/17645161/
- Kang & Han (2015). Modern Language Journal, 99(1), 1–18.
- Brown, D. (2016). Language Teaching Research, 20(4), 436–458. doi:10.1177/1362168814563200
- Nakanishi (2015), meta-análisis de lectura extensiva; Jeon & Day (2016), RFL 28(2), 246–265. https://nflrc.hawaii.edu/rfl/item/354
- Hamada (2019). RELC Journal. https://journals.sagepub.com/doi/10.1177/0033688218771380; Hamada (2016), LTR; Kadota (2019), Routledge.
- Krashen (1985), *The Input Hypothesis*, Longman; Swain (1985); crítica 2020: https://acikerisim.comu.edu.tr/items/27e5cb1c-a512-4eae-ac13-77d953bc05bc
- Dictado: https://asian-efl-journal.com/main-editions-new/using-dictation-to-improve-language-proficiency/index.htm; https://kindai.repo.nii.ac.jp/records/14254

**Algoritmos**
- https://registry.npmjs.org/ts-fsrs/latest (leído directamente)
- https://github.com/open-spaced-repetition/ts-fsrs ; README 5.4.1: https://cdn.jsdelivr.net/npm/ts-fsrs@5.4.1/README.md
- https://raw.githubusercontent.com/open-spaced-repetition/srs-benchmark/main/README.md (leído directamente)
- https://github.com/open-spaced-repetition/fsrs4anki/wiki/abc-of-fsrs ; https://github.com/open-spaced-repetition/fsrs4anki/wiki/The-optimal-retention ; https://domenic.me/fsrs/
- Wozniak, SM-2: https://www-v1.supermemo.com/archives1990-2015/english/ol/sm2

**Recursos de esperanto**
- https://github.com/Esperanto/kurso-zagreba-metodo (README leído directamente) ; https://esperanto12.net
- https://tatoeba.org/downloads (vía búsqueda); https://www.manythings.org/audiosentences/
- https://www.clozemaster.com/blog/?p=7893 ; https://www.aes.org.nz/beginners-resources/ ; https://www.fluentin3months.com/esperanto-learning-resources/ ; https://www.change.org/p/for-the-duolingo-esperanto-courses-por-la-esperanto-kursoj

**Evaluación**
- Council of Europe (2020), Companion Volume: https://rm.coe.int/cefr-companion-volume-with-new-descriptors-2018/1680787989
- UEA-KER: https://edukado.net/ekzamenoj/ker (vía búsqueda); https://www2.ufjf.br/ppglinguistica/2022/11/21/o-ppg-linguistica-sedia-certificacao-internacional-em-esperanto/ ; https://esfconnected.org/2022/09/28/online-c2-exam/

**Audio**
- Common Voice Esperanto: https://datacollective.mozillafoundation.org/datasets/cmflnuzw5u1plk8mv3fyiv6vf (Scripted 23.0) ; https://datacollective.mozillafoundation.org/datasets/cmmysniwj00g0mf07o2efljbv (Spontaneous 3.0)
- Safari TTS: https://developer.apple.com/forums/thread/723503 ; https://bugs.webkit.org/show_bug.cgi?id=243055 ; ResponsiveVoice: https://responsivevoice.org/text-to-speech-languages/teksto-paroladon-en-esperanto/
- MediaRecorder/getUserMedia: https://developer.mozilla.org/en-US/docs/Web/API/navigator/mediaDevices.getUserMedia ; https://addpipe.com/media-recorder-api-demo-audio/

**Cloudflare**
- https://developers.cloudflare.com/changelog/post/2026-09-01-d1-free-tier-limit-enforcement/
- https://developers.cloudflare.com/d1/platform/pricing/ ; /d1/platform/limits/ ; /d1/reference/faq ; /workers/platform/limits/ ; /pages/platform/limits/ (todas vía búsqueda; acceso directo bloqueado)
