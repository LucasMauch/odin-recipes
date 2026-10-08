# Propuesta para contactar a los autores (NO ENVIADA)

**Destino sugerido:** abrir un *issue* en <https://github.com/Esperanto/kurso-zagreba-metodo> (el grupo de Telegram del README, <https://zagreba.telegramo.org/>, es otra vía). Los mantenedores usan esperanto en commits/PR; un mensaje en esperanto o español con resumen en esperanto es lo más cortés.

**Borrador (español):**

> Hola, soy Lucas, estudiante de esperanto de Argentina. Estoy aprendiendo con vuestro curso y armé, para mí, una pequeña app web (PWA) de estudio que usa vuestro contenido tal cual: repaso espaciado (FSRS), escritura de memoria, dictado, cloze y pruebas por lección, todo offline y sin servidores obligatorios. Respeto CC BY-ND (textos eo sin cambios) y CC BY (resto), con atribución completa.
>
> Tengo tres preguntas:
> 1. **Audio de Emilio Cid:** ¿qué licencia tiene exactamente? ¿Podría usarse con CC BY 4.0 y re-alojarse, o prefieren que lo enlace?
> 2. **Tarjetas sobre los textos de lección:** ¿contaría como «adaptación» (ND) hacer ejercicios de hueco con frases de los textos, sin alterarlos?
> 3. ¿Les interesaría incorporar algo de esto? Por ejemplo, un modo de **repaso espaciado/escritura** en esperanto12.net, o un exportador de tarjetas con IDs estables. Puedo contribuir código y revisiones del español rioplatense (voseo) con PRs pequeños.
>
> Repo: <URL>. Gracias por el curso.

**Aportes concretos para ofrecer** (todos con PR pequeño y opt-in):
- Importador YAML→JSON y tarjetas con IDs estables (`tools/importar.py`).
- Tests de integridad de los ejercicios (cloze que reconstruye la frase).
- Variante rioplatense del español como idioma adicional, si les interesa.

**Antes de enviar:** revisar que la app esté publicada y funcionando, y elegir el nombre del repo.
