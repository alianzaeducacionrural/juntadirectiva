// Los 4 "momentos" de la trayectoria, uno por etapa (Inicio/Medio/Actual/Final).
// "Mis raíces" no tiene pregunta que se responda en vivo: la responde el texto
// que ya viene de los .docx (ver profesionales.json / textoInicio), pero se
// muestra igual como pregunta retórica para que las 4 etapas luzcan uniformes.
export const MOMENTOS = {
  Inicio: {
    numero: 1,
    titulo: 'Mis raíces',
    pregunta: '¿Qué soñaba el niño o la niña que fui y qué de esos sueños sigue vivo en mí?',
  },
  Medio: {
    numero: 2,
    titulo: 'Mis decisiones',
    pregunta: '¿Cuál fue la decisión que más transformó el rumbo de mi vida y qué aprendí de ella?',
  },
  Actual: {
    numero: 3,
    titulo: 'Mi propósito',
    pregunta: '¿Cómo estoy usando hoy mi vida y mi trabajo para transformar la vida de otros?',
  },
  Final: {
    numero: 4,
    titulo: 'Mi legado',
    pregunta: 'Cuando mi historia termine, ¿qué quiero que las personas recuerden de mí y de la huella que dejé?',
  },
};
