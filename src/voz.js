// Voz (Web Speech API) y grabación local (MediaRecorder). El audio grabado NUNCA sale del dispositivo.

export function buscarVozEo() {
  const s = globalThis.speechSynthesis;
  if (!s) return null;
  return s.getVoices().find((v) => /^eo([-_]|$)/i.test(v.lang)) ?? null;
}

/** Espera a que el navegador cargue las voces (suele ser asíncrono). */
export function esperarVoces(ms = 1500) {
  return new Promise((res) => {
    const s = globalThis.speechSynthesis;
    if (!s) return res(null);
    if (s.getVoices().length) return res(buscarVozEo());
    const fin = () => res(buscarVozEo());
    s.addEventListener?.('voiceschanged', fin, { once: true });
    setTimeout(fin, ms);
  });
}

export function decir(texto, voz) {
  const s = globalThis.speechSynthesis;
  if (!s || !voz) return false;
  s.cancel();
  const u = new SpeechSynthesisUtterance(texto);
  u.voice = voz; u.lang = voz.lang; u.rate = 0.9;
  s.speak(u);
  return true;
}

export const puedeGrabar = () => !!(globalThis.navigator?.mediaDevices?.getUserMedia && globalThis.MediaRecorder);

export async function crearGrabadora() {
  const flujo = await navigator.mediaDevices.getUserMedia({ audio: true });
  const rec = new MediaRecorder(flujo);
  const trozos = [];
  rec.ondataavailable = (e) => e.data.size && trozos.push(e.data);
  return {
    empezar: () => rec.start(),
    parar: () => new Promise((res) => {
      rec.onstop = () => {
        flujo.getTracks().forEach((t) => t.stop());
        res(URL.createObjectURL(new Blob(trozos, { type: rec.mimeType || 'audio/webm' })));
      };
      rec.stop();
    }),
  };
}
