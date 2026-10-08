// URL base del Worker de sincronización. Vacío = sincronización desactivada (solo local).
// Se reemplaza en el build con la variable de entorno MIA_VOJO_API (ver tools/build.mjs).
export const API_URL = '';

// Audio del curso (grabaciones de Emilio Cid), servido por el sitio original: NO se re-aloja.
// NO VERIFICADO: la ruta se deduce de la plantilla del repo original (assets/mp3/NN.mp3).
export const AUDIO_BASE = 'https://esperanto12.net/assets/mp3/';
