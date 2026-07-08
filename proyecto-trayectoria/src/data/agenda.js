// Puntos de la agenda general que rodean el punto 3 (ver plan, sección 14).
// Se muestran como pantallas dentro de la misma presentación, con el mismo
// estilo visual, para que todo el evento corra desde una sola ventana.

export const NOMBRE_ACTIVIDAD = 'De la Raíz a la Huella - Mis proyectos para la vida';

export const BIENVENIDA = {
  titulo: 'Bienvenidos equipo al mejor microcentro',
};

// Los 4 puntos de la agenda del encuentro. El punto 3 usa el nombre completo
// del instrumento de gobierno; la pantalla de QR y el formulario usan el
// nombre corto de la actividad (NOMBRE_ACTIVIDAD).
export const AGENDA = [
  { numero: 1, titulo: 'Oración' },
  { numero: 2, titulo: 'Reflexión' },
  { numero: 3, titulo: `Instrumento de Gobierno: ${NOMBRE_ACTIVIDAD}` },
  { numero: 4, titulo: 'Valoración de las Actividades de Conjunto' },
];

// Evidencias de aprendizaje de la actividad completa (para la pantalla que
// va antes de arrancar el punto 1).
export const EVIDENCIAS_APRENDIZAJE = [
  'Construyo identidad colectiva a partir del diálogo, el reconocimiento y la valoración de las trayectorias de vida de los integrantes del equipo.',
  'Sustento de manera reflexiva mi historia de vida, articulando mis raíces, experiencias significativas y huellas personales para comprender mi proceso de construcción identitaria.',
  'Valoro las experiencias de vida de mis compañeros, identificando los aprendizajes que aportan a la construcción de proyectos para la vida individuales y colectivos.',
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

// Pantalla de cierre del punto 3: collage con la foto "Actual" de todos los
// profesionales, justo antes de pasar al punto 4.
export const HUELLAS = {
  titulo: 'Las huellas que dejamos',
  parrafos: [
    'Cada paso que damos deja una huella. Algunas se borran con el tiempo, pero otras permanecen en el corazón de quienes comparten el camino con nosotros.',
    'Durante este proceso hemos comprendido que nuestras raíces, experiencias y aprendizajes no solo construyen nuestra historia, sino también la forma en que impactamos la vida de los demás. Cada palabra, cada gesto de apoyo y cada desafío superado han dejado una marca en este equipo.',
    'Que las huellas de este camino nos recuerden siempre de dónde venimos, quiénes somos y el compromiso de seguir construyendo proyectos para la vida con propósito, esperanza y solidaridad.',
  ],
};

// Punto 4 de la agenda: solo título y una pregunta, sin indicadores.
export const EVALUACION = {
  titulo: 'Valoración de las Actividades de Conjunto',
  pregunta: '¿Qué me llevo de la actividad de conjunto?',
};
