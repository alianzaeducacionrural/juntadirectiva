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
  EVIDENCIAS_APRENDIZAJE,
  ORACION,
  REFLEXION,
  TOTAL_EQUIPO,
  UMBRAL_REFLEXION_PROFUNDA,
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
function construirSecuencia(profesionales, respuestasPorNombre) {
  const conRespuesta = [];
  const sinRespuesta = [];
  for (const persona of profesionales) {
    const respuesta = respuestasPorNombre[persona.nombre];
    if (respuesta?.timestamp) conRespuesta.push({ persona, respuesta });
    else sinRespuesta.push({ persona, respuesta });
  }
  conRespuesta.sort((a, b) => new Date(a.respuesta.timestamp) - new Date(b.respuesta.timestamp));

  const slides = [
    { tipo: 'bienvenida' },
    { tipo: 'agenda' },
    { tipo: 'evidencias' },
    { tipo: 'oracion' },
    { tipo: 'reflexion' },
    { tipo: 'qr' },
  ];
  for (const { persona, respuesta } of [...conRespuesta, ...sinRespuesta]) {
    for (const etapa of ETAPAS) {
      slides.push({ tipo: 'persona', persona, respuesta, etapa });
    }
  }
  slides.push({ tipo: 'evaluacion' });
  return slides;
}

function calcularIndicadores(respuestasPorNombre) {
  const respuestas = Object.values(respuestasPorNombre);
  const numRespondieron = respuestas.length;
  const participacion = Math.round((numRespondieron / TOTAL_EQUIPO) * 100);

  const profundas = respuestas.filter((r) => {
    const largos = [r.respuesta1, r.respuesta2, r.respuesta3].map((t) => (t || '').length);
    const promedio = largos.reduce((a, b) => a + b, 0) / largos.length;
    return promedio >= UMBRAL_REFLEXION_PROFUNDA;
  }).length;
  const completitud = numRespondieron > 0 ? Math.round((profundas / numRespondieron) * 100) : 0;

  return { numRespondieron, participacion, completitud };
}

export default function Presentacion() {
  const [profesionales, setProfesionales] = useState([]);
  const [respuestasPorNombre, setRespuestasPorNombre] = useState({});
  const [cargando, setCargando] = useState(true);
  const [indiceSlide, setIndiceSlide] = useState(0);

  const ultimaRevelacion = useRef(null);

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
    () => (profesionales.length ? construirSecuencia(profesionales, respuestasPorNombre) : []),
    [profesionales, respuestasPorNombre]
  );

  function avanzar() {
    setIndiceSlide((i) => Math.min(i + 1, secuencia.length - 1));
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
  }, [secuencia.length]);

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
          {slide.tipo === 'evaluacion' && <SlideEvaluacion respuestasPorNombre={respuestasPorNombre} />}
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
      <h1 className="presentacion-momento-titulo">Escanea para responder</h1>
      <div className="presentacion-qr-tarjeta">{dataUrl && <img src={dataUrl} alt="Código QR del formulario" />}</div>
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
      <h1 className="presentacion-momento-titulo presentacion-momento-titulo--mayuscula">{momento.titulo}</h1>
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

function SlideEvaluacion({ respuestasPorNombre }) {
  const { numRespondieron, participacion, completitud } = calcularIndicadores(respuestasPorNombre);
  return (
    <div className="presentacion-texto-completo">
      <h1 className="presentacion-momento-titulo">Evaluación</h1>
      <div className="presentacion-stats">
        <div className="presentacion-stat">
          <span className="presentacion-stat-numero">{participacion}%</span>
          <span className="presentacion-stat-etiqueta">
            Participación · {numRespondieron} de {TOTAL_EQUIPO}
          </span>
        </div>
        <div className="presentacion-stat">
          <span className="presentacion-stat-numero">{completitud}%</span>
          <span className="presentacion-stat-etiqueta">Reflexiones profundas</span>
        </div>
      </div>
    </div>
  );
}
