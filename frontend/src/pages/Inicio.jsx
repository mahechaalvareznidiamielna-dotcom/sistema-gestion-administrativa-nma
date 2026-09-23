import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, fmtDate, money } from '../api.js';

export default function Inicio() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/inicio')
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="alerta">{error}</div>;
  if (!data) return <p>Cargando resumen...</p>;

  return (
    <section>
      <div className="welcome">
        <div>
          <h2>¡Bienvenido!</h2>
          <p>Aquí tienes un resumen de tu información.</p>
        </div>
      </div>
      <div className="kpi-grid">
        <article className="kpi kpi-green">
          <span>Ingresos</span>
          <strong>{money(data.totalIngresos)}</strong>
          <small>Total ingresos</small>
        </article>
        <article className="kpi kpi-red">
          <span>Gastos</span>
          <strong>{money(data.totalGastos)}</strong>
          <small>Total gastos</small>
        </article>
        <article className="kpi kpi-blue">
          <span>Saldo</span>
          <strong>{money(data.saldo)}</strong>
          <small>Disponible</small>
        </article>
        <article className="kpi kpi-orange">
          <span>Tareas pendientes</span>
          <strong>{data.totalPendientes}</strong>
          <small>Por completar</small>
        </article>
      </div>
      <div className="split">
        <article className="card">
          <h3>Tareas pendientes</h3>
          <ul className="lista-simple">
            {data.tareasPendientes.map((t) => (
              <li key={t.id}>
                <span>{t.nombre}</span>
                <small>{fmtDate(t.fechaLimite)}</small>
                <em className={`badge badge-${t.prioridad}`}>{t.prioridad}</em>
              </li>
            ))}
            {!data.tareasPendientes.length && <li>No hay tareas pendientes.</li>}
          </ul>
          <Link to="/tareas">Ver todas las tareas</Link>
        </article>
        <article className="card">
          <h3>Últimos movimientos</h3>
          <ul className="lista-simple">
            {data.ultimosMovimientos.map((m) => (
              <li key={m.id}>
                <span>{m.descripcion}</span>
                <small>{fmtDate(m.fecha)}</small>
                <em className={m.tipo === 'ingreso' ? 'positivo' : 'negativo'}>
                  {money(m.valor)}
                </em>
              </li>
            ))}
            {!data.ultimosMovimientos.length && <li>No hay movimientos.</li>}
          </ul>
          <Link to="/movimientos">Ver todos los movimientos</Link>
        </article>
      </div>
    </section>
  );
}
