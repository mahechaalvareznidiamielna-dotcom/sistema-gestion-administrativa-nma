import { useEffect, useState } from 'react';
import { api } from '../api.js';

function Lista({ titulo, items, onCrear, onEditar, onEliminar }) {
  const [nombre, setNombre] = useState('');
  const [editId, setEditId] = useState(null);

  const guardar = async (e) => {
    e.preventDefault();
    if (editId) await onEditar(editId, nombre);
    else await onCrear(nombre);
    setNombre('');
    setEditId(null);
  };

  return (
    <article className="card">
      <h3>{titulo}</h3>
      <form className="toolbar" onSubmit={guardar}>
        <input
          placeholder="Nombre de la categoría"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <button className="btn btn-primary">{editId ? 'Actualizar' : 'Agregar'}</button>
        {editId && (
          <button
            type="button"
            className="btn"
            onClick={() => {
              setEditId(null);
              setNombre('');
            }}
          >
            Cancelar
          </button>
        )}
      </form>
      <ul className="lista-categorias">
        {items.map((c) => (
          <li key={c.id}>
            <span>{c.nombre}</span>
            <span className="acciones">
              <button
                className="link"
                onClick={() => {
                  setEditId(c.id);
                  setNombre(c.nombre);
                }}
              >
                Editar
              </button>
              <button className="link-danger" onClick={() => onEliminar(c.id)}>
                Eliminar
              </button>
            </span>
          </li>
        ))}
      </ul>
    </article>
  );
}

export default function Categorias() {
  const [productos, setProductos] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [error, setError] = useState('');

  const cargar = () => {
    api('/categorias/productos').then(setProductos);
    api('/categorias/gastos').then(setGastos);
  };

  useEffect(() => {
    cargar();
  }, []);

  const wrap = (fn) => async (...args) => {
    try {
      setError('');
      await fn(...args);
      cargar();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <section>
      <h2>Categorías</h2>
      <p>Clasifica productos y gastos para organizar la información de la papelería.</p>
      {error && <div className="alerta">{error}</div>}
      <div className="split">
        <Lista
          titulo="Categorías de productos"
          items={productos}
          onCrear={wrap((nombre) => api('/categorias/productos', { method: 'POST', body: { nombre } }))}
          onEditar={wrap((id, nombre) =>
            api(`/categorias/productos/${id}`, { method: 'PATCH', body: { nombre } }),
          )}
          onEliminar={wrap((id) => api(`/categorias/productos/${id}`, { method: 'DELETE' }))}
        />
        <Lista
          titulo="Categorías de gastos"
          items={gastos}
          onCrear={wrap((nombre) => api('/categorias/gastos', { method: 'POST', body: { nombre } }))}
          onEditar={wrap((id, nombre) =>
            api(`/categorias/gastos/${id}`, { method: 'PATCH', body: { nombre } }),
          )}
          onEliminar={wrap((id) => api(`/categorias/gastos/${id}`, { method: 'DELETE' }))}
        />
      </div>
    </section>
  );
}
