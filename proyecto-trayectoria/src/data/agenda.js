// Puntos de la agenda general que rodean el punto 3 (ver plan, sección 14).
// Se muestran como pantallas dentro de la misma presentación, con el mismo
// estilo visual, para que todo el evento corra desde una sola ventana.

export const NOMBRE_ACTIVIDAD = 'De la Raíz a la Huella';

export const BIENVENIDA = {
  titulo: 'Bienvenidos equipo al mejor microcentro',
};

// Los 4 puntos de la agenda del encuentro. El punto 3 usa el nombre real de
// la actividad en vez de un título genérico.
export const AGENDA = [
  { numero: 1, titulo: 'Oración' },
  { numero: 2, titulo: 'Reflexión' },
  { numero: 3, titulo: NOMBRE_ACTIVIDAD },
  { numero: 4, titulo: 'Evaluación' },
];

// Evidencias de aprendizaje de la actividad completa (para la pantalla que
// va antes de arrancar el punto 1). Generadas a partir del diseño de la
// actividad: el registro escrito de las 3 preguntas, el reconocimiento en
// vivo frente al equipo, y el cierre con indicadores en la etapa de
// Evaluación.
export const EVIDENCIAS_APRENDIZAJE = [
  'Reconocimiento colectivo, en vivo, de la historia y evolución personal de cada integrante del equipo.',
  'Fortalecimiento del sentido de pertenencia e identidad de equipo mediante el relato compartido de trayectorias individuales.',
  'Identificación explícita del propósito y el legado que cada profesional quiere dejar en su labor educativa.',
];

export const ORACION = {
  titulo: 'Oración',
  texto: `Señor, tú que eres el Maestro de maestros, hoy te pido que sostengas mi vocación.

Dame un corazón de orientador que no solo llene mentes de conocimiento, sino que sepa leer los silencios, abrazar las realidades de mis estudiantes y descubrir la luz oculta en cada uno de ellos. Concédeme la empatía para comprender sus batallas, el respeto para valorar sus procesos y la humildad para aprender de ellos cada día.

En los momentos de cansancio, cuando sienta que mis palabras se pierden, recuérdame que educar es sembrar en la eternidad. Haz de mí ese faro que guía en la confusión y la mano firme que sostiene con amor y sinceridad. Que antes de dictar una lección, mi vida sea el testimonio vivo de tu paciencia y tu gracia. Amén.`,
};

// Archivo de video servido directamente desde public/ (no un link externo).
// Mientras sea null, la pantalla de Reflexión muestra un aviso de "pendiente".
export const REFLEXION = {
  titulo: 'Reflexión',
  video: 'Reflexión.mp4',
};

// Umbral usado para el "indicador de completitud de reflexión" (sección 11
// del plan): promedio de caracteres de las 3 respuestas de una persona para
// considerarla una reflexión "profunda". Es una heurística, ajústala si hace
// falta.
export const UMBRAL_REFLEXION_PROFUNDA = 60;

// Tamaño real del equipo según el plan (sección 1), independiente de cuántas
// carpetas de materiales existan hoy en Public/Profesionales.
export const TOTAL_EQUIPO = 18;
