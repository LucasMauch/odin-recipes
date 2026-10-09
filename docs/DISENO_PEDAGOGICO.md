# Diseño pedagógico: «Esperanto en 12 lecciones» (PWA para hispanohablantes principiantes)

Fecha: 2026-10-08. Estado: borrador de investigación, no implementado.

**Etiquetas:** [MA] meta-análisis/revisión · [EI] estudio individual · [OP] práctica/opinión · NO VERIFICADO = no pude confirmarlo en las fuentes consultadas.
**Método:** WebSearch (el proxy no bloqueó las búsquedas). No abrí los PDF originales con WebFetch: las cifras salen de resúmenes/abstracts devueltos por la búsqueda y quedan marcadas donde corresponde. Las fuentes `[n]` están al final.

**Problema:** cada lección es un bloque enorme (gramática + texto) y el usuario siente que no aprende.
**Hipótesis de trabajo:** el problema es de carga y de actividad (mucha lectura pasiva, poca recuperación), no de contenido. Se resuelve troceando, practicando tras cada trozo y espaciando.
---

## Resumen de decisiones (para quien lea solo esto)

| # | Decisión | Base |
|---|----------|------|
| 1 | Partir cada lección en 6-9 «temas» de 2-4 min, con 1-2 conceptos nuevos por pantalla | CLT, segmentación [1] |
| 2 | Mini-práctica de 3-5 ítems tras cada tema; intento antes de ver la respuesta cuando el ítem sea adivinable | Pretest [5], PF [6], práctica de recuperación [10] |
| 3 | Feedback inmediato con la respuesta correcta siempre visible, diff carácter a carácter | Feedback [7][8] |
| 4 | Pistas: opcionales, tras un intento fallido, nunca como paso por defecto | [9] mixto |
| 5 | Mostrar la morfología (radical + afijo) en cada palabra nueva | Evidencia propedéutica débil [11][12]; ver sección 4 |
| 6 | Gamificación ligera (progreso visible, metas elegibles); racha con «congelar» y sin castigos | [13][14] |
| 7 | Texto con glosas al toque, relectura y audio sincronizado opcional | [15][16][17] |
| 8 | Flujo de lección en 10 pasos (~25-30 min total, dividible en 3 sesiones) | Sección 8 |
---

## 1. Carga cognitiva y segmentación

**Evidencia**
- La Teoría de la Carga Cognitiva (Sweller) parte de que la memoria de trabajo es limitada y que el diseño debe reducir la carga extrínseca para liberar recursos para construir esquemas. [OP/teoría; resumen secundario, [3]]
- Efecto del ejemplo resuelto: estudiar ejemplos resueltos supera a resolver problemas sin guía en novatos (Sweller y Cooper 1985; Sweller 1988). [EI; vía resumen secundario [3]]
- Efecto de inversión de la pericia (Kalyuga et al. 2003): lo que ayuda al novato deja de ayudar al avanzado; hay que retirar el andamiaje gradualmente. [EI; vía [3]]
- Segmentación y pre-entrenamiento (Mayer y Pilegard 2014): segmentación apoyada en 10 de 10 pruebas, mediana d = 0,79; pre-entrenamiento apoyado en 13 de 16, mediana d = 0,75. [MA narrativo de experimentos de laboratorio, sobre todo multimedia; [1]]. La atribución a Pilegard como coautora de ese capítulo no pude confirmarla en la búsqueda.
- Límite: casi todo viene de multimedia/ciencias en laboratorio, no de gramática de idiomas. [OP, inferencia propia]

**Cómo trocear una lección (mínimo 5-9 temas)**
- Un tema = una idea gramatical o un grupo de vocabulario coherente, con un ejemplo resuelto, 1 regla en una frase y 3-5 ítems.
- Conceptos nuevos por pantalla: **1 regla + máx. 3-4 palabras nuevas**. No hay cifra validada para idiomas: es un criterio de diseño que hay que medir con las métricas de la sección 8. NO VERIFICADO (no busqué límites de memoria de trabajo tipo Cowan).
- Plantilla de pantalla de tema: ejemplo en esperanto con traducción → regla en una frase → «fíjate en…» con el afijo resaltado.
- Pre-entrenamiento: antes del texto, presentar 4-6 palabras clave del texto con audio.

**Qué hacemos en la app**
- Convertir cada lección actual en 6-9 temas (tabla de ejemplo abajo). Regla de corte: si un tema necesita más de una pantalla de explicación, se divide.
- Pantalla de tema máx. ~60-80 palabras de explicación en español; el resto, ejemplos.
- Los ejemplos resueltos van primero; en lecciones posteriores, reducir la explicación y pedir más producción (retirada gradual).
- Cada lección abre con pre-entrenamiento de 4-6 palabras del texto.

| Lección (ej.) | Temas sugeridos (6-9) |
|---|---|
| L1 | Alfabeto/pronunciación · acento tónico · -o (sustantivo) · -j (plural) · -a (adjetivo) · concordancia · artículo «la» · «estas» (presente) · frases con «ne» |
| L2 | -n (acusativo) · orden de palabras · pronombres personales · -as/-is/-os · preguntas con «ĉu» · -e (adverbio) |

(Los temas son ilustrativos, no verifiqué el contenido real del curso en este archivo.)
---

## 2. Pretesting, fracaso productivo y dificultades deseables

**Evidencia**
- Efecto de pretest: responder preguntas antes de leer, aunque se falle, mejora la retención posterior frente a solo estudiar más tiempo (Richland, Kornell y Kao 2009; 5 experimentos). La ventaja suele rondar el 10 % según una nota de prensa; no verifiqué la cifra en el artículo. [EI; [5]] Condición: tiene que haber feedback o una exposición posterior que contenga la respuesta.
- Fracaso productivo / resolver-luego-instrucción: Sinha y Kapur 2021 reunieron 53 estudios (166 comparaciones) y concluyen que intentar primero y recibir instrucción después supera a instrucción-luego-práctica, sobre todo en conceptos. Muestras mayormente de 12-18 años en matemáticas y ciencias. Exige conocimiento previo suficiente. [MA; solo vi la cobertura de prensa, no el artículo: [6]]
- Dificultades deseables (Bjork): la idea de que cierta dificultad mejora la retención a largo plazo. NO VERIFICADO en fuente primaria en esta sesión.
- Práctica de recuperación y espaciada: Dunlosky et al. 2013 calificaron ambas con utilidad alta; releer y subrayar, baja. [MA/revisión; [10]]
- Tensión con la sección 1: un novato absoluto sin conocimiento previo se beneficia más del ejemplo resuelto; el fracaso productivo requiere base. Para esperanto, la regularidad permite deducir reglas desde ejemplos. [OP, inferencia propia]

**Qué hacemos en la app**
- Mini-práctica **tras** cada tema (recuperación), y repaso espaciado de lecciones previas al inicio de cada sesión (3-5 ítems).
- «Adivina antes de ver»: solo cuando el ítem sea deducible (ej.: «¿Cómo se diría “casas”? dom_ _», tras haber visto -o y -j por separado). Con un tema totalmente nuevo, dar primero el ejemplo resuelto.
- Tras el intento, siempre mostrar la respuesta y la regla. Nunca dejar al usuario sin cierre.
- No usar fracaso productivo «puro» (problemas largos sin guía); versión mínima: 1 pretest de 2-3 ítems al inicio de la lección, sin nota.
---

## 3. Pistas, errores y feedback

**Evidencia**
- Pistas en práctica de vocabulario: van den Broek et al. (2019, 3 experimentos de aula): las pistas tras un error no redujeron errores repetidos y solo ayudaron si también estaban en el test; no superaron a mostrar la respuesta. Vaughn y Kornell (2019): pistas de 2 o 4 letras produjeron aprendizaje equivalente a la recuperación pura, y todas superaron a solo mostrar; perjudican si hacen la respuesta adivinable sin recordar. [EI; resúmenes secundarios, [9]]. Liu et al. (2022, *Memory*): pistas graduales mejoraron tras 48 h con pares imagen-palabra. [EI; solo resumen]. Veredicto: **evidencia mixta; la primera letra no se demostró perjudicial ni claramente útil**; lo que importa es no regalar la respuesta.
- Feedback: Wisniewski, Zierer y Hattie (2020): 435 estudios, d = 0,48 global, muy heterogéneo; el contenido informativo del feedback es clave y su efecto es mayor en habilidades cognitivas que en motivación. [MA; [8]]
- Feedback inmediato vs. diferido: Butler y Roediger (2008): el feedback (inmediato o diferido) aumentó respuestas correctas y redujo intrusiones de distractores tras test de opción múltiple. [EI; resumen secundario, [7]]. No encontré un meta-análisis que decida inmediato vs. diferido: NO VERIFICADO.
- Diff carácter a carácter: no encontré estudio que lo evalúe en esta sesión. NO VERIFICADO; es decisión de UX [OP].

**Qué hacemos en la app**
- Feedback inmediato por ítem (en ítems de producción corta). Mostrar siempre la respuesta correcta y una explicación de una línea («-j = plural»).
- Error de escritura: mostrar la respuesta del usuario y la correcta alineadas; resaltar solo los caracteres distintos (y color + subrayado/símbolo, no solo color). Marcar aparte los acentos esperantistas (ĉ ĝ ĥ ĵ ŝ ŭ).
- Pistas: botón «Pista» opcional **solo tras un primer intento fallido**; 1.ª pista = categoría/afijo esperado (ej.: «sustantivo plural»), 2.ª = primera letra. Registrar si se usó pista y reprogramar esos ítems como «más débiles».
- Ítems con pista cuentan menos para el SRS que los resueltos sin ayuda.
- Aceptar variantes con x-sistemas (cx, ux) como entrada válida y mostrar la forma con diacrítico.
---

## 4. Conciencia morfológica y vocabulario

**Evidencia**
- Goodwin y Ahn 2010 (Annals of Dyslexia), meta-análisis de 17 estudios sobre intervenciones morfológicas en niños con dificultades de lectura en inglés: vocabulario d = 0,40, conciencia morfológica d = 0,40. [MA; resumen vía búsqueda, [11]]. Es población y lengua distintas (niños, inglés): generalización a adultos hispanohablantes aprendiendo esperanto, no demostrada.
- Una revisión de alcance de 2021 sobre instrucción morfológica en lectores jóvenes de L2 reporta mejoras en conciencia morfológica y vocabulario de efecto pequeño a grande, con pocos estudios de transferencia. [MA/revisión; resumen, [12]]
- Propedéutica del esperanto: estudios clásicos (Reino Unido 1968; Finlandia; Paderborn/San Marino) reportan ventaja posterior en la segunda lengua, pero con autoselección y bajo rigor. [EI, evidencia débil; [4]]. Un estudio controlado reciente (Essex) encontró que el esperanto era más fácil para niños novatos, pero **sin** ventaja medible en conciencia metalingüística ni en el aprendizaje posterior de otra lengua. [EI; [4]]
- Williams 1965, Thorndike y Kennon 1927: aparecen solo como referencias; no confirmé sus hallazgos. Fantini y Corsetti: no hallé nada en esta sesión. **NO VERIFICADO.**
- Regularidad del esperanto (afijos fijos, terminaciones de clase de palabra) es un hecho lingüístico, no un resultado de investigación educativa. [OP]

**Qué hacemos en la app**
- Mostrar cada palabra nueva segmentada: `mal-san-ul-o` con tooltip por morfema («mal- = opuesto»).
- Tabla viva de afijos (los ~20 más productivos) accesible desde cualquier pantalla; cada afijo se presenta con 2-3 palabras ya conocidas.
- Ejercicios de «construye la palabra» (arrastrar morfemas) y de «deduce el significado» con palabras nuevas derivadas de raíces vistas.
- No prometer en la app ni en el marketing «el esperanto te ayuda con otros idiomas».
- Medir en piloto si las palabras derivadas se recuerdan mejor que las no segmentadas (A/B interno).
---

## 5. Gamificación y motivación

**Evidencia**
- Sailer y Homner 2020 (*Educational Psychology Review*, 32(1), 77-112): efectos pequeños y positivos: cognitivos g = 0,49 (k = 19; estable con estudios rigurosos), motivacionales g = 0,36 (k = 16), conductuales g = 0,25 (k = 9; IC 0,04-0,46); la ficción de juego y combinar competencia con colaboración moderan los efectos conductuales. Pocos estudios; motivacionales y conductuales, menos estables. [MA; [13]]
- Teoría de la autodeterminación (Ryan y Deci 2000, *American Psychologist*, 55(1), 68-78): los contextos que apoyan autonomía, competencia y relación favorecen la motivación intrínseca y el bienestar. [OP/teoría; solo vi la ficha bibliográfica, [14]]
- Rachas: no hallé estudios controlados sobre el efecto de la racha en el aprendizaje. Solo declaraciones de Duolingo (aversión a la pérdida), un resumen de charla y encuestas pequeñas con autoinforme; algunos usuarios reportan presión y ansiedad. [OP; [18]]. El riesgo de que la racha refuerce hacer lo mínimo para no perderla es hipótesis de diseño, **NO VERIFICADO**.

| Elemento SDT | Qué implica en la app |
|---|---|
| Autonomía | Elegir meta diaria (5/10/15 min), orden de práctica, saltar ítems |
| Competencia | Progreso visible por tema/lección; feedback informativo; dificultad ajustada |
| Relación | Opcional: compartir progreso o estudiar con un amigo (no ranking obligatorio) |

**Qué hacemos en la app**
- Barra de progreso por lección (temas completados) y mapa de 12 lecciones; sin puntos por clicar.
- Meta diaria elegible, **racha opcional**, con días de descanso y «congelar» automático; sin pérdida dramática ni notificaciones culpabilizantes.
- XP/puntos solo si se atan a recuperación espaciada completada, no a tiempo en pantalla.
- Sin clasificaciones competitivas en v1. Evaluar colaboración opcional más tarde (apoyada por [13] para efectos conductuales).
---

## 6. UX/UI de apps de idiomas y SRS; accesibilidad

**Patrones observados (conocimiento general, no verificado con fuentes en esta sesión)**
- Duolingo: una tarea por pantalla, feedback inmediato, sesiones cortas, progreso visible. [OP]
- Anki: repetición espaciada por tarjeta, autoevaluación (de nuevo/difícil/bien/fácil). [OP]
- Clozemaster: frases con hueco (cloze) en contexto. [OP]
- Memrise, Busuu: no verificados. Ninguno de estos patrones fue contrastado con fuentes aquí: **NO VERIFICADO**.

**Accesibilidad (WCAG 2.2) — verificado vía búsqueda [19][20][21]**

| Criterio | Nivel | Requisito | Decisión |
|---|---|---|---|
| 2.5.8 Tamaño del objetivo (mínimo) | AA | ≥ 24×24 px CSS, o separación suficiente; con excepciones | Mínimo duro |
| 2.5.5 Tamaño del objetivo (mejorado) | AAA | ≥ 44×44 px CSS | Objetivo en móvil para botones principales |
| 1.4.3 Contraste (mínimo) | AA | 4,5:1 texto normal; 3:1 texto grande | Cumplir en ambos temas (claro/oscuro) |
| 1.4.8 Presentación visual | AAA | Ancho ≤ 80 caracteres; interlineado ≥ 1,5; sin justificado; párrafos separados | Aplicar como criterio de diseño |

- Longitud de línea: Baymard recomienda 50-75 caracteres para texto de cuerpo [EI/OP; [22]]. Objetivo de la app: 45-75 caracteres con tope de 80.
- Interlineado 1,5 para textos del curso; sin texto justificado.
- Las guías nativas de tamaño táctil de iOS/Android (44 pt / 48 dp) no las verifiqué: NO VERIFICADO.

**Qué hacemos en la app**
- Una tarea por pantalla con botón principal grande (≥ 44 px) y fijo abajo (zona del pulgar).
- Sesión corta con fin claro: «Terminaste este tema» antes de ofrecer más.
- Texto de lectura con `max-width` ~ 65ch, interlineado 1,5–1,6, tamaño base ≥ 16-18 px, contraste ≥ 4,5:1.
- Teclado: botones para ĉ ĝ ĥ ĵ ŝ ŭ en el campo de respuesta (objetivos ≥ 44 px).
- No transmitir correcto/incorrecto solo con color.
---

## 7. Lectura para principiantes

**Evidencia**
- Glosas: Yanagisawa, Webb y Uchihara 2020 (*SSLA*, 42(2), 411-438; 42 estudios, N = 3802): lectura con glosas → 45 % (inmediato) / 33 % (diferido) de palabras aprendidas vs. 27 % / 20 % sin glosas. Glosas en L1 mejores que en L2; sin diferencias significativas por modo (texto, imagen, audio); las de opción múltiple fueron las más efectivas; en el texto y glosarios, las menos. [MA; abstract, [15]]. Kim, Lee y Lee 2024 (*Language Teaching Research*): L1 > L2, g = 0,33, ventaja mayor en principiantes. [MA; resumen, [15b]]
- Leer escuchando: Webb, Uchihara y Yanagisawa 2023 (*Language Teaching*; 24 estudios, N = 2771): ganancias incidentales de vocabulario modestas (6-18 %); leer, escuchar y leer-escuchando dieron resultados similares (13-17 %). [MA; [16]]. Estudios individuales (Brown et al. 2008; Webb y Chang 2015) suelen favorecer leer-escuchando frente a solo leer, con diferencias por nivel y L1; hay estudios sin diferencia (TwiLex 2024). [EI; solo resumen secundario, [16]]. Por tanto: efecto incierto, no un beneficio asegurado.
- Lectura repetida: concepto establecido para fluidez (Nation); en L2 la evidencia que vi es limitada (un estudio con 46 estudiantes no halló diferencia entre grupos, aunque la velocidad mejoró). [OP/EI; [17]]. No encontré un meta-análisis de relectura en L2 en esta sesión: NO VERIFICADO.

**Qué hacemos en la app**
- Texto con glosa al toque en español (L1), con la palabra segmentada en morfemas y el audio de la palabra.
- Glosas siempre disponibles, y el toque se registra para alimentar el SRS (palabras tocadas = candidatas a repaso).
- Audio del texto sincronizado, activable (no obligatorio); velocidad ajustable.
- Primera lectura con glosas; segunda lectura (tras los temas) sin glosas ni audio, como control de comprensión; ofrecer pregunta de comprensión de 3 ítems.
---

## 8. Flujo propuesto de lección

Total ≈ 25-30 min, dividible en 3 sesiones de 8-10 min (Sesión A: pasos 1-4; B: 5-7; C: 8-10). Los tiempos son estimaciones de diseño [OP], a calibrar en piloto.

| Paso | Qué ocurre | Min | Justificación |
|---|---|---|---|
| 0 | Repaso espaciado de lecciones previas (3-5 ítems) | 2 | Práctica distribuida y de recuperación [10] |
| 1 | Pre-entrenamiento: 4-6 palabras clave con audio y morfemas | 2 | Pre-entrenamiento [1] |
| 2 | Texto con glosas al toque + audio opcional | 3 | Glosas [15], lectura-escucha [16] |
| 3 | Tema 1: ejemplo resuelto + regla (1 pantalla) | 1,5 | CLT, ejemplos resueltos [3] |
| 4 | Mini-práctica 1 (3-5 ítems, feedback inmediato) | 1,5 | Recuperación [10], feedback [7][8] |
| 5 | Temas 2…n con su mini-práctica (repetir 3-4) | 2-3 c/u (≈ 12) | Segmentación [1] |
| 6 | Práctica mezclada: ítems de todos los temas + de lecciones anteriores | 4 | Práctica espaciada/entremezclada [10] (interleaving: moderada) |
| 7 | Relectura del texto sin ayudas + 3 preguntas | 3 | Relectura [17]; comprensión |
| 8 | Prueba final de lección (8-10 ítems, sin pistas, con feedback al terminar) | 3 | Recuperación sin ayuda [10] |
| 9 | Resumen: temas dominados, palabras para repasar; meta del día | 0,5 | Competencia y autonomía [14] |

**Métricas para decidir (piloto):** % de lecciones terminadas; ítems correctos a las 24-48 h; uso de pistas; abandono por paso; tiempo por tema; tasa de errores de acento/diacríticos.
---

## NO VERIFICADO / límites

- Solo usé WebSearch; no abrí los artículos originales. Todas las cifras proceden de abstracts y resúmenes que devolvió el buscador, y pueden contener errores. Verificarlas antes de citarlas externamente.
- No verificados: Bjork (dificultades deseables, fuente primaria); límites de memoria de trabajo (Cowan/Miller); Fantini, Corsetti, Williams y Thorndike (hallazgos); cualquier estudio de diff carácter a carácter; feedback inmediato vs. diferido en idiomas; efecto de rachas sobre el aprendizaje; patrones concretos de Duolingo, Anki, Clozemaster, Memrise y Busuu; tamaños táctiles nativos iOS/Android; efecto de la primera letra como pista de forma concluyente.
- Generalización: gran parte de la evidencia viene de multimedia/ciencias, niños o inglés como L2; no de adultos hispanohablantes aprendiendo esperanto.
- Los números de «1-2 conceptos por pantalla», los tiempos por paso y el mínimo de 6-9 temas son decisiones de diseño a validar con datos de uso.

## Fuentes

1. Mayer, R. E., y Pilegard, C. (2014). Principles for managing essential processing in multimedia learning: segmenting, pre-training, and modality principles. En *The Cambridge Handbook of Multimedia Learning* (2.ª ed.). https://www.cambridge.org/core/books/cambridge-handbook-of-multimedia-learning/principles-for-managing-essential-processing-in-multimedia-learning-segmenting-pretraining-and-modality-principles/DD24C2F48B9B1277CE59F78276110258 (autoría exacta no confirmada)
3. Sweller, J. (1988). Cognitive load during problem solving: effects on learning. *Cognitive Science*, 12(2), 257-285; Kalyuga, Ayres, Chandler y Sweller (2003), inversión de la pericia. Solo vía resúmenes secundarios: https://notes.andymatuschak.org/z9oJyCh2UgEHU1LrkqNGDxm y https://en.wikipedia.org/wiki/Worked-example_effect
4. Propedéutica del esperanto: resumen en https://en-academic.com/dic.nsf/enwiki/327884 y estudio controlado de Essex https://repository.essex.ac.uk/24243/ [EI; secundario/baja calidad para los estudios clásicos].
5. Richland, L. E., Kornell, N., y Kao, L. S. (2009). The pretesting effect: do unsuccessful retrieval attempts enhance learning? *J. Exp. Psychol.: Applied*. https://learninglab.uchicago.edu/Pre-Testing_files/RichlandKornellKao.pdf
6. Sinha, T., y Kapur, M. (2021). When problem solving followed by instruction works: evidence for productive failure. *Review of Educational Research*. DOI 10.3102/00346543211019105. Cobertura: https://www.weforum.org/stories/2021/09/students-who-productively-fail-learn-more/ ; ETH: https://www.research-collection.ethz.ch/entities/publication/93a6fe24-dde9-4f59-ad42-fc4476064bdf (artículo no leído)
7. Butler, A. C., y Roediger, H. L. (2008). Feedback enhances the positive effects and reduces the negative effects of multiple-choice testing. *Memory & Cognition*, 36, 604-616. https://pmc.ncbi.nlm.nih.gov/articles/PMC4094137 (resumen secundario)
8. Wisniewski, B., Zierer, K., y Hattie, J. (2020). The power of feedback revisited: a meta-analysis of educational feedback research. *Frontiers in Psychology*, 10, 3087. https://www.frontiersin.org/articles/10.3389/fpsyg.2019.03087/full
9. van den Broek, G. et al. (2019), hints en práctica de vocabulario, https://cognitiveresearchjournal.springeropen.com/track/pdf/10.1186/s41235-019-0187-y ; Vaughn, K. E., y Kornell, N. (2019); Liu et al. (2022), *Memory*, https://research-information.bris.ac.uk/en/publications/progressive-retrieval-practice-leads-to-greater-memory-for-image-/ (solo resúmenes; autoría/enlaces de Vaughn y Kornell no verificados)
10. Dunlosky, J., Rawson, K. A., Marsh, E. J., Nathan, M. J., y Willingham, D. T. (2013). Improving students' learning with effective learning techniques. *Psychological Science in the Public Interest*, 14(1), 4-58. DOI 10.1177/1529100612453266. https://stafforini.com/works/dunlosky-2013-improving-students-learning/
11. Goodwin, A. P., y Ahn, S. (2010). A meta-analysis of morphological interventions: effects on literacy achievement of children with literacy difficulties. *Annals of Dyslexia*. https://apps.asha.org/EvidenceMaps/Articles/ArticleSummary/93cb3843-8a27-4b52-887b-32781be13e92
12. Morphological instruction and reading development in young L2 readers: a scoping review (2021). https://ore.exeter.ac.uk/repository/handle/10871/124247?show=full (autores y año exactos no verificados)
13. Sailer, M., y Homner, L. (2020). The gamification of learning: a meta-analysis. *Educational Psychology Review*, 32(1), 77-112. https://link.springer.com/article/10.1007/s10648-019-09498-w
14. Ryan, R. M., y Deci, E. L. (2000). Self-determination theory and the facilitation of intrinsic motivation, social development, and well-being. *American Psychologist*, 55(1), 68-78. DOI 10.1037/0003-066X.55.1.68 (texto no leído)
15. Yanagisawa, A., Webb, S., y Uchihara, T. (2020). How do different forms of glossing contribute to L2 vocabulary learning from reading? *SSLA*, 42(2), 411-438. https://www.cambridge.org/core/product/38124150D59DF3039EE1FF5AE88FE922 ; 15b. Kim, Lee y Lee (2024), *Language Teaching Research*, meta-análisis de glosas L1 vs. L2 (solo resumen vía búsqueda; sin URL directa).
16. Webb, S., Uchihara, T., y Yanagisawa, A. (2023). How effective is second language incidental vocabulary learning? A meta-analysis. *Language Teaching*. https://www.cambridge.org/core/services/aop-cambridge-core/content/view/S0261444822000507 ; también https://todoele.net/bibliografia/how-effective-second-language-incidental-vocabulary-learning-meta-analysis
17. Lectura repetida en L2 (Nation; estudios de fluidez): https://scholarspace.manoa.hawaii.edu/items/e427f255-15af-4d3c-9766-a4627da192f9 (solo resumen)
18. Duolingo (s.f.). How Duolingo streak builds habit. https://blog.duolingo.com/how-duolingo-streak-builds-habit [OP, fuente de la empresa]
19. W3C (WCAG 2.2). SC 2.5.8 Target Size (Minimum) y 2.5.5 Target Size (Enhanced), resumidos en https://getstark.co/wcag-explained/operable/input-modalities/target-size-enhanced (secundaria; verificar en w3.org)
20. W3C. SC 1.4.3 Contrast (Minimum). https://www.w3.org/TR/2016/NOTE-UNDERSTANDING-WCAG20-20161007/visual-audio-contrast-contrast.html
21. W3C. SC 1.4.8 Visual Presentation (AAA). https://www.w3.org/WAI/WCAG22/Understanding/visual-presentation
22. Baymard Institute. Readability: the optimal line length. https://baymard.com/blog/line-length-readability
