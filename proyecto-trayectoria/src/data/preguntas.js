import { MOMENTOS } from './momentos.js';

// El formulario solo pregunta los momentos 2, 3 y 4 — el momento 1 ("Mis
// raíces") ya está resuelto por el texto que viene de los .docx.
export const preguntas = [
  { id: 'respuesta1', momento: MOMENTOS.Medio },
  { id: 'respuesta2', momento: MOMENTOS.Actual },
  { id: 'respuesta3', momento: MOMENTOS.Final },
];
