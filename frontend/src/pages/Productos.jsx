import { useEffect, useState } from 'react';
import { api, money } from '../api.js';

const vacio = {
  nombre: '',
  categoriaId: '',
  cantidadDisponible: 0,
  precioCompra: 0,
  precioVenta: 0,
  ubicacion: '',
  observaciones: '',
};

export default function Productos() {
  const [items, setItems] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [q, setQ] = useState('');
  const [form, setForm] = useState(vacio);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  const cargar = () => {
    const path = q ? `/productos?q=${encodeURIComponent(q)}` : '/productos';
    api(path).then(setItems).catch((e) => setError(e.message));
  };

  useEffect(() => {
    cargar();
    api('/categorias/productos').then(setCategorias);
  }, []);

  const guardar = async (e) => {
    e.preventDefault();
    const body = {
      ...form,
      categoriaId: Number(form.categoriaId),
      cantidadDisponible: Number(form.cantidadDisponible),
      precioCompra: Number(form.precioCompra),
      precioVenta: Number(form.precioVenta),
    };
    try {
      if (editId) await api(`/productos/${editId}`, { method: 'PATCH', body });
      else await api('/productos', { method: 'POST', body });
      setForm(vacio);
      setEditId(null);
      cargar();
    } catch (err) {
      setError(err.message);
    }
  };

  const editar = (p) => {
    setEditId(p.id);
    setForm({
      nombre: p.nombre,
      categoriaId: p.categoriaId,
      cantidadDisponible: p.cantidadDisponible,
      precioCompra: p.precioCompra,
      precioVenta: p.precioVenta,
      ubicacion: p.ubicacion || '',
      observaciones: p.observaciones || '',
    });
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return;
    await api(`/productos/${id}`, { method: 'DELETE' });
    cargar();
  };

  return (
    <section className="card">
      <div className="page-head">
        <div>
          <h2>Productos</h2>
          <p>Registra existencias, precios y ubicación para organizar el espacio del local.</p>
        </div>
      </div>
      {error && <div className="alerta">{error}</div>}
      <form className="form-grid" onSubmit={guardar}>
        <label>
          Nombre *
          <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
        </label>
        <label>
          Categoría *
          <select
            value={form.categoriaId}
            onChange={(e) => setForm({ ...form, categoriaId: e.target.value })}
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
        <label>
          Cantidad disponible *
          <input
            type="number"
            min="0"
            value={form.cantidadDisponible}
            onChange={(e) => setForm({ ...form, cantidadDisponible: e.target.value })}
          />
        </label>
        <label>
          Precio de compra *
          <input
            type="number"
            min="0"
            value={form.precioCompra}
            onChange={(e) => setForm({ ...form, precioCompra: e.target.value })}
          />
        </label>
        <label>
          Precio de venta *
          <input
            type="number"
            min="0"
            value={form.precioVenta}
            onChange={(e) => setForm({ ...form, precioVenta: e.target.value })}
          />
        </label>
        <label>
          Ubicación
          <input
            value={form.ubicacion}
            onChange={(e) => setForm({ ...form, ubicacion: e.target.value })}
            placeholder="Ej. Estante A1"
          />
        </label>
        <label className="full">
          Observaciones
          <input
            value={form.observaciones}
            onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
          />
        </label>
        <div className="form-actions full">
          {editId && (
            <button
              type="button"
              className="btn"
              onClick={() => {
                setEditId(null);
                setForm(vacio);
              }}
            >
              Cancelar
            </button>
          )}
          <button className="btn btn-primary">{editId ? 'Actualizar producto' : 'Registrar producto'}</button>
        </div>
      </form>
      <div className="toolbar">
        <input
          placeholder="Buscar producto..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && cargar()}
        />
        <button className="btn" onClick={cargar}>
          Buscar
        </button>
      </div>
      <div className="tabla-wrap">
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Cantidad</th>
              <th>Compra</th>
              <th>Venta</th>
              <th>Ubicación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id}>
                <td>{p.nombre}</td>
                <td>{p.categoria?.nombre}</td>
                <td>{p.cantidadDisponible}</td>
                <td>{money(p.precioCompra)}</td>
                <td>{money(p.precioVenta)}</td>
                <td>{p.ubicacion || '-'}</td>
                <td className="acciones">
                  <button className="link" onClick={() => editar(p)}>
                    Editar
                  </button>
                  <button className="link-danger" onClick={() => eliminar(p.id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
