# Atribuciones / NOTICE

**Mia Vojo** se basa en el curso *Esperanto en 12 lecciones* (método Zagreb), publicado en
<https://esperanto12.net/> y en <https://github.com/Esperanto/kurso-zagreba-metodo>.
Esta aplicación no está respaldada ni avalada por los autores del curso.

## Autores del curso (AUTHORS.md del repo original)
- **Contenido (método Zagreb):** Zlatko Tišljar, Spomenka Štimec, Ivica Špoljarec, Roger Imbert.
- **Sitio web:** Georg Jähnig (<https://github.com/georgjaehnig/>). **Soporte PWA:** Joop Kiefte (<https://github.com/lapingvino/>).
- **Audio:** Emilio Cid (<https://github.com/EmilioCid>). Licencia del audio: ver `docs/LICENCIAS.md` (pregunta abierta). La app NO re-aloja el audio.
- **Traducción al español** (`agordoj/lingvoj.yml`): Enric Baltasar (@enricbaltasar), Alejandro Escobedo (@alescomu), Guillermo Molleda Jimena (@gmolledaj).

## Qué se usa y bajo qué licencia
| Material | Licencia | Cómo se usa aquí |
|---|---|---|
| Textos de lección en esperanto | [CC BY-ND 4.0](https://creativecommons.org/licenses/by-nd/4.0/) | Mostrados **sin cambios** (`lecciones/NN.json`, campo `texto`; solo cambia el formato YAML→JSON). |
| Traducción al español, gramática, ejercicios, vocabulario | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | Se muestran y se derivan tarjetas (`cartas`). **Modificado:** reorganizado en JSON y convertido en tarjetas de práctica. |
| ts-fsrs 5.4.2 (Open Spaced Repetition) | MIT | Vendorizado en `src/vendor/ts-fsrs/` con su LICENSE. |
| Código de esta app | MIT (ver `LICENSE`) | Propio. |

Repositorio original: commit `7c10690487207a1d4a273c757aa46c14f9d07670` (23-ago-2026).
