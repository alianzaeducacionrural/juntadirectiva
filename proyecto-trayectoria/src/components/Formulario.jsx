import { useEffect, useState } from 'react';
import { preguntas } from '../data/preguntas.js';
import { enviarRespuesta } from '../services/sheetsApi.js';
import FondoAnimado from './FondoAnimado.jsx';

const COLOR_FORMULARIO = '#7c6fe0';

export default function Formulario() {
  const [profesionales, setProfesionales] = useState([]);
  const [nombre, setNombre] = useState('');
  const [respuestas, setRespuestas] = useState({ respuesta1: '', respuesta2: '', respuesta3: '' });
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}profesionales/profesionales.json`)
      .then((r) => r.json())
      .then((lista) => setProfesionales(lista.map((p) => p.nombre).sort()))
      .catch(() => setError('No se pudo cargar la lista de nombres. Recarga la página.'));
  }, []);

  function actualizarRespuesta(id, valor) {
    setRespuestas((prev) => ({ ...prev, [id]: valor }));
  }

  async function manejarEnvio(e) {
    e.preventDefault();
    setError('');

    if (!nombre) {
      setError('Selecciona tu nombre.');
      return;
    }
    if (preguntas.some((p) => !respuestas[p.id]?.trim())) {
      setError('Responde las 3 preguntas antes de enviar.');
      return;
    }

    setEnviando(true);
    try {
      await enviarRespuesta({ nombre, ...respuestas });
      setEnviado(true);
    } catch (err) {
      setError(err.message || 'No se pudo guardar tu respuesta. Intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <div className="formulario-pagina">
        <FondoAnimado color={COLOR_FORMULARIO} />
        <div className="formulario-tarjeta formulario-confirmacion">
          <h1 className="formulario-titulo">¡Gracias!</h1>
          <p>Tu respuesta quedó guardada. Ya puedes cerrar esta pestaña.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="formulario-pagina">
      <FondoAnimado color={COLOR_FORMULARIO} />
      <form className="formulario-tarjeta" onSubmit={manejarEnvio}>
        <h1 className="formulario-titulo">De la Raíz a la Huella</h1>
        <p className="formulario-subtitulo">Actividad de conjunto — Punto 3</p>
        <p className="formulario-intro">
          Momento 1 · Mis raíces ya quedó contado en tu historia. Ahora completemos los otros tres momentos.
        </p>

        {error && <p className="formulario-mensaje-error">{error}</p>}

        <div className="formulario-campo">
          <label htmlFor="nombre">¿Quién eres?</label>
          <select id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required>
            <option value="">Selecciona tu nombre...</option>
            {profesionales.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        {preguntas.map((p) => (
          <div className="formulario-campo" key={p.id}>
            <span className="formulario-momento">
              Momento {p.momento.numero} · {p.momento.titulo}
            </span>
            <label htmlFor={p.id}>{p.momento.pregunta}</label>
            <textarea
              id={p.id}
              value={respuestas[p.id]}
              onChange={(e) => actualizarRespuesta(p.id, e.target.value)}
              required
            />
          </div>
        ))}

        <button className="formulario-boton" type="submit" disabled={enviando}>
          {enviando ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
    </div>
  );
}
