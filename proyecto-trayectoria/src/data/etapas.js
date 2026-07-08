// Las 4 etapas de la línea de tiempo, en orden fijo (sección 4.2 del plan).
export const ETAPAS = ['Inicio', 'Medio', 'Actual', 'Final'];

// A partir de qué índice de etapa se revela el nombre (sección 5: se revela en "Actual").
export const INDICE_REVELACION_NOMBRE = ETAPAS.indexOf('Actual');

export function textoDeEtapa(profesional, respuesta, indiceEtapa) {
  if (indiceEtapa === 0) return profesional?.textoInicio || '';
  const campo = `respuesta${indiceEtapa}`;
  return respuesta?.[campo] || '';
}
