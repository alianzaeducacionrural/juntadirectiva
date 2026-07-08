import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import QRCode from 'qrcode';
import { obtenerRespuestas } from '../services/sheetsApi.js';
import { ETAPAS, INDICE_REVELACION_NOMBRE, textoDeEtapa } from '../data/etapas.js';
import { MOMENTOS } from '../data/momentos.js';
import {
  AGENDA,
  BIENVENIDA,
  EVALUACION,
  EVIDENCIAS_APRENDIZAJE,
  HUELLAS,
  NOMBRE_ACTIVIDAD,
  ORACION,
  REFLEXION,
} from '../data/agenda.js';
import FondoAnimado from './FondoAnimado.jsx';

const COLOR_ETAPA = {
  Inicio: '#5b8def',
  Medio: '#a55de2',
  Actual: '#ef4d7a',
  Final: '#f4a53f',
};

const COLOR_BIENVENIDA = '#ff5f8f';
const COLOR_AGENDA = '#5b8def';
const COLOR_EVIDENCIAS = '#c084fc';
const COLOR_ORACION = '#e8b74d';
const COLOR_REFLEXION = '#3fb5c8';
const COLOR_QR = '#22c55e';
const COLOR_HUELLAS = '#e0793f';
const COLOR_EVALUACION = '#4dbd74';

function lanzarConfetti(color) {
  const disparo = (opciones) =>
    confetti({
      origin: { y: 0.6 },
      colors: [color, '#ffffff', '#f4a53f'],
      ...opciones,
    });
  disparo({ particleCount: 90, spread: 70, angle: 60, origin: { x: 0.15, y: 0.6 } });
  disparo({ particleCount: 90, spread: 70, angle: 120, origin: { x: 0.85, y: 0.6 } });
}

// Ordena a las personas por el momento en que enviaron su respuesta
// (no hay panel de facilitador eligiendo el orden). Quien no ha respondido
// todavía queda al final, en el orden original, para que nadie se quede
// afuera del reconocimiento.
//
// `personasFinalizadas` son los carpeta ya presentados hasta ahora — van
// primero, en el orden en que ya se mostraron (congelado, no se reordenan).
// El resto ("por presentar") se recalcula cada vez con los datos más
// recientes, así que si llega un nuevo registro mientras el facilitador
// avanza, esa persona puede aparecer antes que alguien que todavía no ha
// respondido, sin desordenar a quienes ya salieron en pantalla.
function construirSecuencia(profesionales, respuestasPorNombre, personasFinalizadas) {
  const finalizadasSet = new Set(personasFinalizadas);
  const yaFinalizadas = personasFinalizadas
    .map((carpeta) => profesionales.find((p) => p.carpeta === carpeta))
    .filter(Boolean);

  const porPresentar = profesionales.filter((p) => !finalizadasSet.has(p.carpeta));
  const conRespuesta = [];
  const sinRespuesta = [];
  for (const persona of porPresentar) {
    const respuesta = respuestasPorNombre[persona.nombre];
    if (respuesta?.timestamp) conRespuesta.push({ persona, respuesta });
    else sinRespuesta.push({ persona, respuesta });
  }
  conRespuesta.sort((a, b) => new Date(a.respuesta.timestamp) - new Date(b.respuesta.timestamp));

  const personasEnOrden = [
    ...yaFinalizadas.map((persona) => ({ persona, respuesta: respuestasPorNombre[persona.nombre] })),
    ...conRespuesta,
    ...sinRespuesta,
  ];

  const slides = [
    { tipo: 'bienvenida' },
    { tipo: 'agenda' },
    { tipo: 'evidencias' },
    { tipo: 'oracion' },
    { tipo: 'reflexion' },
    { tipo: 'qr' },
  ];
  for (const { persona, respuesta } of personasEnOrden) {
    for (const etapa of ETAPAS) {
      slides.push({ tipo: 'persona', persona, respuesta, etapa });
    }
  }
  slides.push({ tipo: 'huellas' });
  slides.push({ tipo: 'evaluacion' });
  return slides;
}

export default function Presentacion() {
  const [profesionales, setProfesionales] = useState([]);
  const [respuestasPorNombre, setRespuestasPorNombre] = useState({});
  const [cargando, setCargando] = useState(true);
  const [indiceSlide, setIndiceSlide] = useState(0);
  const [personasFinalizadas, setPersonasFinalizadas] = useState([]);

  const ultimaRevelacion = useRef(null);
  // El listener de teclado solo se reengancha cuando `secuencia` cambia (ver
  // más abajo), así que `avanzar` puede quedar con un closure viejo de
  // `indiceSlide` entre esos reenganches — de ahí el ref, para leer siempre
  // el índice real en el momento del click/tecla, no el de cuando se creó
  // el closure.
  const indiceSlideRef = useRef(indiceSlide);
  useEffect(() => {
    indiceSlideRef.current = indiceSlide;
  }, [indiceSlide]);
  // Evita que una segunda tecla/click, presionada mientras el refetch de una
  // etapa "Final" todavía está en vuelo, dispare otro avanzar() concurrente:
  // sin esto, dos llamadas solapadas terminan sumando +2 al índice (cada una
  // resuelve su propio setIndiceSlide) y se salta una diapositiva completa.
  const avanzandoRef = useRef(false);

  useEffect(() => {
    async function cargar() {
      try {
        const lista = await fetch(`${import.meta.env.BASE_URL}profesionales/profesionales.json`).then((r) =>
          r.json()
        );
        setProfesionales(lista);
      } catch {
        // sin profesionales.json no hay nada que mostrar; se deja la lista vacía.
      }
      try {
        const respuestas = await obtenerRespuestas();
        const porNombre = {};
        for (const r of respuestas) porNombre[r.nombre] = r;
        setRespuestasPorNombre(porNombre);
      } catch {
        // backend no configurado o sin respuestas todavía: se sigue igual,
        // cada momento se ve como "Respuesta pendiente".
      }
      setCargando(false);
    }
    cargar();
  }, []);

  const secuencia = useMemo(
    () => (profesionales.length ? construirSecuencia(profesionales, respuestasPorNombre, personasFinalizadas) : []),
    [profesionales, respuestasPorNombre, personasFinalizadas]
  );

  // Justo al salir del último momento ("Final") de una persona, se refrescan
  // las respuestas por si llegó un registro nuevo mientras tanto — así quien
  // sigue en pantalla es quien realmente corresponde según el orden de
  // llegada, no solo el orden que se conocía cuando se abrió la presentación.
  async function avanzar() {
    if (avanzandoRef.current) return;
    avanzandoRef.current = true;
    try {
      const actual = secuencia[indiceSlideRef.current];
      if (actual?.tipo === 'persona' && actual.etapa === 'Final') {
        setPersonasFinalizadas((prev) =>
          prev.includes(actual.persona.carpeta) ? prev : [...prev, actual.persona.carpeta]
        );
        try {
          const respuestas = await obtenerRespuestas();
          const porNombre = {};
          for (const r of respuestas) porNombre[r.nombre] = r;
          setRespuestasPorNombre(porNombre);
        } catch {
          // sin conexión momentánea: se sigue con los datos que ya había.
        }
      }
      setIndiceSlide((i) => Math.min(i + 1, secuencia.length - 1));
    } finally {
      avanzandoRef.current = false;
    }
  }

  function retroceder() {
    setIndiceSlide((i) => Math.max(i - 1, 0));
  }

  useEffect(() => {
    function manejarTecla(e) {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        avanzar();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        retroceder();
      }
    }
    window.addEventListener('keydown', manejarTecla);
    return () => window.removeEventListener('keydown', manejarTecla);
  }, [secuencia]);

  const slide = secuencia[indiceSlide];

  useEffect(() => {
    if (slide?.tipo !== 'persona' || slide.etapa !== 'Actual') return;
    const clave = `${slide.persona.carpeta}-actual`;
    if (ultimaRevelacion.current === clave) return;
    ultimaRevelacion.current = clave;
    lanzarConfetti(COLOR_ETAPA.Actual);
  }, [slide]);

  if (cargando) {
    return (
      <div className="presentacion">
        <FondoAnimado color={COLOR_BIENVENIDA} />
        <p className="presentacion-vacio">Cargando...</p>
      </div>
    );
  }

  if (!slide) {
    return (
      <div className="presentacion">
        <FondoAnimado color={COLOR_BIENVENIDA} />
        <p className="presentacion-vacio">No hay datos de profesionales.json todavía.</p>
      </div>
    );
  }

  const COLOR_POR_TIPO = {
    bienvenida: COLOR_BIENVENIDA,
    agenda: COLOR_AGENDA,
    evidencias: COLOR_EVIDENCIAS,
    oracion: COLOR_ORACION,
    reflexion: COLOR_REFLEXION,
    qr: COLOR_QR,
    huellas: COLOR_HUELLAS,
    evaluacion: COLOR_EVALUACION,
  };
  const color = slide.tipo === 'persona' ? COLOR_ETAPA[slide.etapa] : COLOR_POR_TIPO[slide.tipo];

  return (
    <div className="presentacion" style={{ '--color-etapa': color }} onClick={avanzar}>
      <FondoAnimado color={color} />

      {slide.tipo === 'persona' && (
        <div className="presentacion-barra-progreso">
          {ETAPAS.map((e, i) => (
            <span
              key={e}
              className={`presentacion-punto${e === slide.etapa ? ' activo' : ''}${
                ETAPAS.indexOf(e) < ETAPAS.indexOf(slide.etapa) ? ' completado' : ''
              }`}
            />
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={indiceSlide}
          className="presentacion-slide"
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {slide.tipo === 'bienvenida' && <SlideBienvenida />}
          {slide.tipo === 'agenda' && <SlideAgenda />}
          {slide.tipo === 'evidencias' && <SlideEvidencias />}
          {slide.tipo === 'oracion' && <SlideOracion />}
          {slide.tipo === 'reflexion' && <SlideReflexion />}
          {slide.tipo === 'qr' && <SlideQR />}
          {slide.tipo === 'persona' && <SlidePersona slide={slide} />}
          {slide.tipo === 'huellas' && <SlideHuellas profesionales={profesionales} />}
          {slide.tipo === 'evaluacion' && <SlideEvaluacion />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function SlideBienvenida() {
  return (
    <div className="presentacion-texto-completo">
      <img
        className="presentacion-bienvenida-foto"
        src={`${import.meta.env.BASE_URL}bienvenida-equipo.jpeg`}
        alt="El equipo"
      />
      <h1 className="presentacion-bienvenida-titulo">{BIENVENIDA.titulo}</h1>
    </div>
  );
}

function SlideAgenda() {
  return (
    <div className="presentacion-texto-completo">
      <h1 className="presentacion-momento-titulo">Agenda</h1>
      <ol className="presentacion-agenda-lista">
        {AGENDA.map((item) => (
          <li key={item.numero} className="presentacion-agenda-item">
            <span className="presentacion-agenda-numero">{item.numero}</span>
            <span>{item.titulo}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function SlideEvidencias() {
  return (
    <div className="presentacion-texto-completo">
      <h1 className="presentacion-momento-titulo">Evidencias de aprendizaje</h1>
      <ul className="presentacion-evidencias-lista">
        {EVIDENCIAS_APRENDIZAJE.map((texto, i) => (
          <li key={i}>{texto}</li>
        ))}
      </ul>
    </div>
  );
}

function SlideOracion() {
  return (
    <div className="presentacion-texto-completo presentacion-slide-oracion">
      <h1 className="presentacion-momento-titulo">{ORACION.titulo}</h1>
      <p className="presentacion-cuerpo presentacion-cuerpo-oracion">{ORACION.texto}</p>
    </div>
  );
}

function SlideReflexion() {
  return (
    <div className="presentacion-texto-completo">
      <h1 className="presentacion-momento-titulo">{REFLEXION.titulo}</h1>
      {REFLEXION.video ? (
        <div className="presentacion-video" onClick={(e) => e.stopPropagation()}>
          <video src={`${import.meta.env.BASE_URL}${encodeURIComponent(REFLEXION.video)}`} controls playsInline />
        </div>
      ) : (
        <div className="presentacion-imagen-placeholder">Video pendiente</div>
      )}
    </div>
  );
}

// El QR apunta al formulario ("/") en el mismo origen donde esté corriendo
// esta presentación — no hay URL fija porque no sabemos de antemano el
// dominio final de GitHub Pages.
function SlideQR() {
  const [dataUrl, setDataUrl] = useState(null);
  const url = `${window.location.origin}${window.location.pathname}#/`;

  useEffect(() => {
    QRCode.toDataURL(url, { width: 360, margin: 1, color: { dark: '#111111', light: '#ffffff' } }).then(
      setDataUrl
    );
  }, [url]);

  return (
    <div className="presentacion-texto-completo">
      <h1 className="presentacion-momento-titulo">{NOMBRE_ACTIVIDAD}</h1>
      <p className="presentacion-qr-subtitulo">Escanea para responder</p>
      <div className="presentacion-qr-tarjeta">{dataUrl && <img src={dataUrl} alt="Código QR del formulario" />}</div>
    </div>
  );
}

// Collage de cierre del punto 3: la foto "Actual" de cada profesional, con
// una leve rotación alterna (vía nth-child en CSS) para que no se vea como
// una grilla plana, y la frase superpuesta en una tarjeta de vidrio.
function SlideHuellas({ profesionales }) {
  const fotos = profesionales.filter((p) => p.imagenes?.Actual);

  return (
    <div className="presentacion-huellas">
      <div className="presentacion-huellas-collage">
        {fotos.map((persona, i) => (
          <motion.img
            key={persona.carpeta}
            className="presentacion-huellas-foto"
            src={`${import.meta.env.BASE_URL}profesionales/${persona.carpeta}/${persona.imagenes.Actual}`}
            alt=""
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: i * 0.06, ease: 'easeOut' }}
          />
        ))}
      </div>
      <div className="presentacion-huellas-overlay" />
      <div className="presentacion-huellas-tarjeta">
        <h1 className="presentacion-momento-titulo">{HUELLAS.titulo}</h1>
        {HUELLAS.parrafos.map((texto, i) => (
          <p key={i} className="presentacion-huellas-parrafo">
            {texto}
          </p>
        ))}
      </div>
    </div>
  );
}

function SlidePersona({ slide }) {
  const { persona, respuesta, etapa } = slide;
  const momento = MOMENTOS[etapa];
  const nombreVisible = ETAPAS.indexOf(etapa) >= INDICE_REVELACION_NOMBRE;
  const texto = textoDeEtapa(persona, respuesta, ETAPAS.indexOf(etapa));
  const archivoImagen = persona.imagenes?.[etapa];

  return (
    <>
      <h1 className="presentacion-momento-titulo">{momento.titulo}</h1>
      <div className="presentacion-contenido">
        <div className="presentacion-imagen-wrap">
          {archivoImagen ? (
            <motion.img
              key={`${persona.carpeta}-${etapa}`}
              className="presentacion-imagen"
              src={`${import.meta.env.BASE_URL}profesionales/${persona.carpeta}/${archivoImagen}`}
              alt=""
              initial={{ scale: 1.18 }}
              animate={{ scale: 1 }}
              transition={{ duration: 7, ease: 'easeOut' }}
            />
          ) : (
            <div className="presentacion-imagen-placeholder">Foto pendiente</div>
          )}
        </div>

        <div className="presentacion-texto">
          <AnimatePresence mode="wait">
            {nombreVisible && (
              <motion.h2
                key="nombre"
                className="presentacion-nombre"
                initial={{ opacity: 0, scale: 0.6, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 220, damping: 16, delay: 0.25 }}
              >
                {persona.nombre}
              </motion.h2>
            )}
          </AnimatePresence>
          <p className="presentacion-pregunta">{momento.pregunta}</p>
          <p className={`presentacion-cuerpo${texto ? '' : ' pendiente'}`}>{texto || 'Respuesta pendiente'}</p>
        </div>
      </div>
    </>
  );
}

function SlideEvaluacion() {
  return (
    <div className="presentacion-texto-completo">
      <h1 className="presentacion-momento-titulo">{EVALUACION.titulo}</h1>
      <p className="presentacion-pregunta">{EVALUACION.pregunta}</p>
    </div>
  );
}
