import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import Layout from './layout/Layout.jsx';
import Login from './pages/Login.jsx';
import Inicio from './pages/Inicio.jsx';
import Tareas from './pages/Tareas.jsx';
import TareaForm from './pages/TareaForm.jsx';
import Movimientos from './pages/Movimientos.jsx';
import Reportes from './pages/Reportes.jsx';
import Categorias from './pages/Categorias.jsx';
import Productos from './pages/Productos.jsx';
import Configuracion from './pages/Configuracion.jsx';

function Privado({ children }) {
  const { usuario, cargando } = useAuth();
  if (cargando) return <div className="pantalla-carga">Cargando...</div>;
  if (!usuario) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const { usuario, cargando } = useAuth();
  if (cargando) return <div className="pantalla-carga">Cargando...</div>;

  return (
    <Routes>
      <Route
        path="/login"
        element={usuario ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/"
        element={
          <Privado>
            <Layout />
          </Privado>
        }
      >
        <Route index element={<Inicio />} />
        <Route path="tareas" element={<Tareas />} />
        <Route path="tareas/nueva" element={<TareaForm />} />
        <Route path="tareas/:id" element={<TareaForm />} />
        <Route path="movimientos" element={<Movimientos />} />
        <Route path="reportes" element={<Reportes />} />
        <Route path="categorias" element={<Categorias />} />
        <Route path="productos" element={<Productos />} />
        <Route path="configuracion" element={<Configuracion />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
