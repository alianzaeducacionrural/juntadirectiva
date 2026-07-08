import { Routes, Route } from 'react-router-dom';
import Formulario from './components/Formulario.jsx';
import Presentacion from './components/Presentacion.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Formulario />} />
      <Route path="/presentacion" element={<Presentacion />} />
    </Routes>
  );
}
