// Backend de la actividad (Fase 2 del plan).
// Este script debe vivir *vinculado* a la hoja de cálculo de Google que
// contendrá la hoja "Respuestas" (Herramientas > Editor de secuencia de
// comandos, desde la propia hoja). Luego: Implementar > Nueva implementación
// > Aplicación web, ejecutar como "Yo", acceso "Cualquier usuario".

const NOMBRE_HOJA = 'Respuestas';
const ENCABEZADOS = ['Timestamp', 'Nombre', 'Respuesta1', 'Respuesta2', 'Respuesta3'];

function obtenerHoja_() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  let hoja = libro.getSheetByName(NOMBRE_HOJA);
  if (!hoja) {
    hoja = libro.insertSheet(NOMBRE_HOJA);
    hoja.appendRow(ENCABEZADOS);
  }
  return hoja;
}

function responderJson_(objeto) {
  return ContentService.createTextOutput(JSON.stringify(objeto)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function doPost(e) {
  try {
    const datos = JSON.parse(e.postData.contents);
    const { nombre, respuesta1, respuesta2, respuesta3 } = datos;

    if (!nombre || !respuesta1 || !respuesta2 || !respuesta3) {
      return responderJson_({ status: 'error', mensaje: 'Faltan campos obligatorios.' });
    }

    const hoja = obtenerHoja_();
    const valores = hoja.getDataRange().getValues();

    // Si la persona ya había respondido, se sobreescribe su fila
    // (decisión pendiente de la sección 6.1: se prefiere la última respuesta).
    // El Timestamp original se conserva: la presentación ordena a las personas
    // por el momento en que respondieron por primera vez, no por si corrigieron
    // texto después.
    let filaExistente = -1;
    let timestampOriginal = null;
    for (let i = 1; i < valores.length; i++) {
      if (valores[i][1] === nombre) {
        filaExistente = i + 1; // getRange es 1-indexado
        timestampOriginal = valores[i][0];
        break;
      }
    }

    const fila = [timestampOriginal || new Date(), nombre, respuesta1, respuesta2, respuesta3];
    if (filaExistente > 0) {
      hoja.getRange(filaExistente, 1, 1, fila.length).setValues([fila]);
    } else {
      hoja.appendRow(fila);
    }

    return responderJson_({ status: 'ok' });
  } catch (err) {
    return responderJson_({ status: 'error', mensaje: String(err) });
  }
}

function doGet(e) {
  const hoja = obtenerHoja_();
  const valores = hoja.getDataRange().getValues();
  const filas = valores.slice(1); // sin encabezados

  const respuestas = filas
    .filter((fila) => fila[1]) // con nombre
    .map((fila) => ({
      timestamp: fila[0] instanceof Date ? fila[0].toISOString() : fila[0],
      nombre: fila[1],
      respuesta1: fila[2],
      respuesta2: fila[3],
      respuesta3: fila[4],
    }));

  return responderJson_(respuestas);
}
