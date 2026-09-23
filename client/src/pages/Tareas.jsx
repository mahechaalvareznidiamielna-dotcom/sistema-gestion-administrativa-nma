import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, fmtDate } from '../api.js';

export default function Tareas() {
  const [q, setQ] = useState('');
  const [estado, setEstado] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [error, setError] = useState('');

  const cargar = () => {
    const params = new URLSearchParams({ page, limit: 8 });
    if (q) params.set('q', q);
    if (estado) params.set('estado', estado);
    api(`/tareas?${params}`)
      .then(setData)
      .catch((e) => setError(e.message));
  };

  useEffect(() => {
    cargar();
  }, [page, estado]);

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar esta tarea?')) return;
    await api(`/tareas/${id}`, { method: 'DELETE' });
    cargar();
  };

  return (
    <section className="card">
      <div className="page-head">
        <div>
          <h2>Mis tareas</h2>
          <p>Consulta y administra tus tareas y pendientes.</p>
        </div>
        <Link className="btn btn-primary" to="/tareas/nueva">
          + Nueva tarea
        </Link>
      </div>
      {error && <div className="alerta">{error}</div>}
      <div className="toolbar">
        <input
          placeholder="Buscar tarea..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (setPage(1), cargar())}
        />
        <select
          value={estado}
          onChange={(e) => {
            setPage(1);
            setEstado(e.target.value);
          }}
        >
          <option value="">Todas las tareas</option>
          <option value="pendiente">Pendientes</option>
          <option value="completada">Completadas</option>
        </select>
        <button className="btn" onClick={() => { setPage(1); cargar(); }}>
          Buscar
        </button>
      </div>
      <div className="tabla-wrap">
        <table>
          <thead>
            <tr>
              <th>Tarea</th>
              <th>Fecha límite</th>
              <th>Prioridad</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((t) => (
              <tr key={t.id}>
                <td>{t.nombre}</td>
                <td>{fmtDate(t.fechaLimite)}</td>
                <td>
                  <span className={`badge badge-${t.prioridad}`}>{t.prioridad}</span>
                </td>
                <td>
                  <span className={`badge badge-${t.estado}`}>{t.estado}</span>
                </td>
                <td className="acciones">
                  <Link to={`/tareas/${t.id}`}>Editar</Link>
                  <button className="link-danger" onClick={() => eliminar(t.id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="paginacion">
        <span>
          Mostrando {data.items.length} de {data.total} tareas
        </span>
        <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
          ‹
        </button>
        <strong>{page}</strong>
        <button disabled={page >= data.pages} onClick={() => setPage(page + 1)}>
          ›
        </button>
      </div>
    </section>
  );
}
