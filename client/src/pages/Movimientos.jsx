import { useEffect, useState } from 'react';
import { api, fmtDate, money } from '../api.js';

const hoy = new Date();
const inicioMes = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-01`;
const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)
  .toISOString()
  .slice(0, 10);

const formVacio = {
  tipo: 'ingreso',
  fecha: hoy.toISOString().slice(0, 10),
  descripcion: '',
  valor: '',
  observacion: '',
  formaPago: 'efectivo',
  cantidad: 1,
  categoriaGastoId: '',
  productoId: '',
};

export default function Movimientos() {
  const [filtros, setFiltros] = useState({
    desde: inicioMes,
    hasta: finMes,
    categoriaGastoId: '',
    q: '',
  });
  const [data, setData] = useState({ items: [], totalIngresos: 0, totalGastos: 0, saldo: 0 });
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(formVacio);
  const [error, setError] = useState('');

  const cargar = () => {
    const params = new URLSearchParams();
    if (filtros.desde) params.set('desde', filtros.desde);
    if (filtros.hasta) params.set('hasta', filtros.hasta);
    if (filtros.categoriaGastoId) params.set('categoriaGastoId', filtros.categoriaGastoId);
    if (filtros.q) params.set('q', filtros.q);
    api(`/movimientos?${params}`).then(setData).catch((e) => setError(e.message));
  };

  useEffect(() => {
    cargar();
    api('/categorias/gastos').then(setCategorias);
    api('/productos').then(setProductos);
  }, []);

  const abrir = (tipo, item) => {
    setError('');
    if (item) {
      setForm({
        tipo: item.tipo,
        fecha: String(item.fecha).slice(0, 10),
        descripcion: item.descripcion,
        valor: item.valor,
        observacion: item.observacion || '',
        formaPago: item.formaPago || 'efectivo',
        cantidad: item.cantidad || 1,
        categoriaGastoId: item.categoriaGastoId || '',
        productoId: item.productoId || '',
      });
      setModal(item.id);
    } else {
      setForm({ ...formVacio, tipo });
      setModal('nuevo');
    }
  };

  const guardar = async (e) => {
    e.preventDefault();
    const body = {
      ...form,
      valor: Number(form.valor),
      cantidad: form.tipo === 'ingreso' ? Number(form.cantidad) || undefined : undefined,
      categoriaGastoId:
        form.tipo === 'gasto' ? Number(form.categoriaGastoId) : undefined,
      productoId: form.tipo === 'ingreso' && form.productoId ? Number(form.productoId) : undefined,
    };
    try {
      if (modal === 'nuevo') await api('/movimientos', { method: 'POST', body });
      else await api(`/movimientos/${modal}`, { method: 'PATCH', body });
      setModal(null);
      cargar();
    } catch (err) {
      setError(err.message);
    }
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este movimiento?')) return;
    await api(`/movimientos/${id}`, { method: 'DELETE' });
    cargar();
  };

  return (
    <section className="card">
      <div className="page-head">
        <div>
          <h2>Ingresos y gastos</h2>
          <p>Registra y consulta los movimientos económicos.</p>
        </div>
        <div className="acciones">
          <button className="btn btn-success" onClick={() => abrir('ingreso')}>
            + Registrar ingreso
          </button>
          <button className="btn btn-danger" onClick={() => abrir('gasto')}>
            + Registrar gasto
          </button>
        </div>
      </div>
      {error && !modal && <div className="alerta">{error}</div>}
      <div className="toolbar">
        <input
          type="date"
          value={filtros.desde}
          onChange={(e) => setFiltros({ ...filtros, desde: e.target.value })}
        />
        <input
          type="date"
          value={filtros.hasta}
          onChange={(e) => setFiltros({ ...filtros, hasta: e.target.value })}
        />
        <select
          value={filtros.categoriaGastoId}
          onChange={(e) => setFiltros({ ...filtros, categoriaGastoId: e.target.value })}
        >
          <option value="">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
        <input
          placeholder="Buscar"
          value={filtros.q}
          onChange={(e) => setFiltros({ ...filtros, q: e.target.value })}
        />
        <button className="btn btn-primary" onClick={cargar}>
          Buscar
        </button>
      </div>
      <div className="tabla-wrap">
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Descripción</th>
              <th>Categoría</th>
              <th>Valor</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((m) => (
              <tr key={m.id}>
                <td>{fmtDate(m.fecha)}</td>
                <td className={m.tipo === 'ingreso' ? 'positivo' : 'negativo'}>
                  {m.tipo === 'ingreso' ? '↑ Ingreso' : '↓ Gasto'}
                </td>
                <td>{m.descripcion}</td>
                <td>
                  {m.tipo === 'gasto'
                    ? m.categoriaGasto?.nombre
                    : m.producto?.nombre || 'Ventas'}
                </td>
                <td>{money(m.valor)}</td>
                <td className="acciones">
                  <button className="link" onClick={() => abrir(m.tipo, m)}>
                    Editar
                  </button>
                  <button className="link-danger" onClick={() => eliminar(m.id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

      {modal && (
        <div className="modal-bg" onClick={() => setModal(null)}>
          <form className="card modal" onClick={(e) => e.stopPropagation()} onSubmit={guardar}>
            <h3>{form.tipo === 'ingreso' ? 'Registrar ingreso' : 'Registrar gasto'}</h3>
            {error && <div className="alerta">{error}</div>}
            <label>
              Fecha *
              <input
                type="date"
                value={form.fecha}
                onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                required
              />
            </label>
            <label>
              Descripción *
              <input
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                required
              />
            </label>
            <label>
              Valor *
              <input
                type="number"
                min="1"
                value={form.valor}
                onChange={(e) => setForm({ ...form, valor: e.target.value })}
                required
              />
            </label>
            {form.tipo === 'ingreso' && (
              <>
                <label>
                  Producto vendido
                  <select
                    value={form.productoId}
                    onChange={(e) => setForm({ ...form, productoId: e.target.value })}
                  >
                    <option value="">Sin producto específico</option>
                    {productos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} (stock {p.cantidadDisponible})
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Cantidad
                  <input
                    type="number"
                    min="1"
                    value={form.cantidad}
                    onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
                  />
                </label>
                <label>
                  Forma de pago
                  <select
                    value={form.formaPago}
                    onChange={(e) => setForm({ ...form, formaPago: e.target.value })}
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="tarjeta">Tarjeta</option>
                    <option value="otro">Otro</option>
                  </select>
                </label>
              </>
            )}
            {form.tipo === 'gasto' && (
              <label>
                Categoría *
                <select
                  value={form.categoriaGastoId}
                  onChange={(e) => setForm({ ...form, categoriaGastoId: e.target.value })}
                  required
                >
                  <option value="">Seleccione</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label>
              Observación
              <input
                value={form.observacion}
                onChange={(e) => setForm({ ...form, observacion: e.target.value })}
              />
            </label>
            <div className="form-actions">
              <button type="button" className="btn" onClick={() => setModal(null)}>
                Cancelar
              </button>
              <button className="btn btn-primary">Guardar</button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
