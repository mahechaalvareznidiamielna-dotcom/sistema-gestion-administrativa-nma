import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

const Icon = ({ d }) => (
  <svg viewBox="0 0 24 24" className="nav-icon" aria-hidden="true">
    <path fill="currentColor" d={d} />
  </svg>
);

const items = [
  { to: '/', label: 'Inicio', end: true, d: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z' },
  { to: '/tareas', label: 'Tareas', d: 'M19 3H5c-1.1 0-2 .9-2 2v14l4-4h12c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z' },
  { to: '/movimientos', label: 'Ingresos y Gastos', d: 'M3 17h4v4H3zm7-6h4v10h-4zm7-6h4v16h-4z' },
  { to: '/reportes', label: 'Reportes', d: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z' },
  { to: '/productos', label: 'Productos', d: 'M20 2H4v2l8 3 8-3V2zM4 8v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-8 3-8-3z' },
  { to: '/categorias', label: 'Categorías', d: 'M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84L22 12l-4.37-6.16z' },
  { to: '/configuracion', label: 'Configuración', d: 'M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96a7.2 7.2 0 00-1.62-.94l-.36-2.54a.48.48 0 00-.48-.41h-3.84a.48.48 0 00-.48.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 00-.59.22L2.74 8.87a.49.49 0 00.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.13.23.4.32.64.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.48-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.49 0 .62-.22l1.92-3.32a.49.49 0 00-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1112 8.4a3.6 3.6 0 010 7.2z' },
];

export default function Layout() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const inicial = usuario?.nombre?.charAt(0)?.toUpperCase() || 'U';

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">📋</span>
          <div>
            <strong>Gestión</strong>
            <span>Administrativa</span>
          </div>
        </div>
        <nav>
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              <Icon d={item.d} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button
          className="btn-logout"
          onClick={() => {
            logout();
            navigate('/login');
          }}
        >
          Cerrar sesión
        </button>
      </aside>
      <div className="main">
        <header className="topbar">
          <h1>Sistema de Gestión Administrativa</h1>
          <div className="topbar-user" title={usuario?.nombre}>
            {inicial}
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
