const URL_APPS_SCRIPT = import.meta.env.VITE_APPS_SCRIPT_URL;

if (!URL_APPS_SCRIPT) {
  console.warn(
    'VITE_APPS_SCRIPT_URL no está configurada. Copia .env.example a .env y coloca la URL del Web App.'
  );
}

// Se envía sin header Content-Type: application/json a propósito.
// Google Apps Script no responde a la solicitud OPTIONS de preflight CORS,
// así que forzamos text/plain (no dispara preflight) y en Code.gs se
// parsea igual el body como JSON.
export async function enviarRespuesta({ nombre, respuesta1, respuesta2, respuesta3 }) {
  const res = await fetch(URL_APPS_SCRIPT, {
    method: 'POST',
    body: JSON.stringify({ nombre, respuesta1, respuesta2, respuesta3 }),
  });
  if (!res.ok) {
    throw new Error(`Error al guardar la respuesta (HTTP ${res.status})`);
  }
  const data = await res.json();
  if (data.status !== 'ok') {
    throw new Error(data.mensaje || 'Error desconocido al guardar la respuesta');
  }
  return data;
}

export async function obtenerRespuestas() {
  const res = await fetch(URL_APPS_SCRIPT, { method: 'GET' });
  if (!res.ok) {
    throw new Error(`Error al obtener respuestas (HTTP ${res.status})`);
  }
  return res.json();
}
