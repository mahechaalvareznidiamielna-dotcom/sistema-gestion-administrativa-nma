import { useEffect, useState } from 'react';
import { api, money } from '../api.js';

const hoy = new Date();
const inicioMes = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-01`;
const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)
  .toISOString()
  .slice(0, 10);

const colores = ['#7c6bf0', '#4caf91', '#f0b429', '#ef6b6b', '#5aa0e6', '#9b59b6'];

export default function Reportes() {
  const [desde, setDesde] = useState(inicioMes);
  const [hasta, setHasta] = useState(finMes);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const generar = () => {
    api(`/reportes?desde=${desde}&hasta=${hasta}`)
      .then(setData)
      .catch((e) => setError(e.message));
  };

  useEffect(() => {
    generar();
  }, []);

  if (error) return <div className="alerta">{error}</div>;
  if (!data) return <p>Cargando reportes...</p>;

  const maxBar = Math.max(data.totalIngresos, data.totalGastos, 1);
  const totalCat = data.gastosPorCategoria.reduce((s, c) => s + c.valor, 0) || 1;
  let acc = 0;
  const slices = data.gastosPorCategoria.map((c, i) => {
    const start = acc;
    const pct = c.valor / totalCat;
    acc += pct;
    return { ...c, start, pct, color: colores[i % colores.length] };
  });

  return (
    <section>
      <div className="card page-head">
        <div>
          <h2>Reportes</h2>
          <p>Consulta los reportes de ingresos, gastos y saldo.</p>
        </div>
        <div className="toolbar">
          <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
          <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
          <button className="btn btn-primary" onClick={generar}>
            Generar reporte
          </button>
        </div>
      </div>
      <div className="kpi-grid">
        <article className="kpi kpi-green">
          <span>Total ingresos</span>
          <strong>{money(data.totalIngresos)}</strong>
        </article>
        <article className="kpi kpi-red">
          <span>Total gastos</span>
          <strong>{money(data.totalGastos)}</strong>
        </article>
        <article className="kpi kpi-blue">
          <span>Saldo</span>
          <strong>{money(data.saldo)}</strong>
        </article>
      </div>
      <div className="split">
        <article className="card">
          <h3>Ingresos vs Gastos</h3>
          <div className="bars">
            <div>
              <span>Ingresos</span>
              <div className="bar">
                <i style={{ width: `${(data.totalIngresos / maxBar) * 100}%` }} className="bar-green" />
              </div>
              <small>{money(data.totalIngresos)}</small>
            </div>
            <div>
              <span>Gastos</span>
              <div className="bar">
                <i style={{ width: `${(data.totalGastos / maxBar) * 100}%` }} className="bar-red" />
              </div>
              <small>{money(data.totalGastos)}</small>
            </div>
          </div>
        </article>
        <article className="card">
          <h3>Gastos por categoría</h3>
          <div className="donut-wrap">
            <svg viewBox="0 0 42 42" className="donut">
              {slices.map((s) => (
                <circle
                  key={s.nombre}
                  r="15.915"
                  cx="21"
                  cy="21"
                  fill="transparent"
                  stroke={s.color}
                  strokeWidth="6"
                  strokeDasharray={`${s.pct * 100} ${100 - s.pct * 100}`}
                  strokeDashoffset={25 - s.start * 100}
                />
              ))}
            </svg>
            <ul>
              {slices.map((s) => (
                <li key={s.nombre}>
                  <i style={{ background: s.color }} />
                  {s.nombre} {s.porcentaje}% ({money(s.valor)})
                </li>
              ))}
              {!slices.length && <li>No hay gastos en el periodo.</li>}
            </ul>
          </div>
        </article>
      </div>
      <article className="card detalle-periodo">
        <h3>Detalle del periodo</h3>
        <div className="formula">
          <span>
            Saldo inicial
            <strong>{money(data.saldoInicial)}</strong>
          </span>
          <span>+</span>
          <span>
            Total ingresos
            <strong>{money(data.totalIngresos)}</strong>
          </span>
          <span>-</span>
          <span>
            Total gastos
            <strong>{money(data.totalGastos)}</strong>
          </span>
          <span>=</span>
          <span>
            Saldo final
            <strong>{money(data.saldoFinal)}</strong>
          </span>
        </div>
      </article>
    </section>
  );
}
