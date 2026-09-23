import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';

const vacio = {
  nombre: '',
  descripcion: '',
  fecha: new Date().toISOString().slice(0, 10),
  fechaLimite: new Date().toISOString().slice(0, 10),
  prioridad: 'alta',
  estado: 'pendiente',
};

export default function TareaForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(vacio);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      api(`/tareas/${id}`)
        .then((t) =>
          setForm({
            nombre: t.nombre,
            descripcion: t.descripcion,
            fecha: String(t.fecha).slice(0, 10),
            fechaLimite: String(t.fechaLimite).slice(0, 10),
            prioridad: t.prioridad,
            estado: t.estado,
          }),
        )
        .catch((e) => setError(e.message));
    }
  }, [id]);

  const set = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  const guardar = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api(id ? `/tareas/${id}` : '/tareas', {
        method: id ? 'PATCH' : 'POST',
        body: form,
      });
      navigate('/tareas');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="card form-card">
      <div className="page-head">
        <div>
          <h2>{id ? 'Editar tarea' : 'Registrar nueva tarea'}</h2>
          <p>Completa la información para {id ? 'actualizar' : 'crear'} una tarea.</p>
        </div>
        <Link className="btn" to="/tareas">
          Volver
        </Link>
      </div>
      {error && <div className="alerta">{error}</div>}
      <form className="form-grid" onSubmit={guardar}>
        <label>
          Nombre de la tarea *
          <input value={form.nombre} onChange={set('nombre')} required />
        </label>
        <label className="full">
          Descripción *
          <textarea value={form.descripcion} onChange={set('descripcion')} required />
        </label>
        <label>
          Fecha *
          <input type="date" value={form.fecha} onChange={set('fecha')} required />
        </label>
        <label>
          Fecha límite *
          <input type="date" value={form.fechaLimite} onChange={set('fechaLimite')} required />
        </label>
        <label>
          Prioridad *
          <select value={form.prioridad} onChange={set('prioridad')}>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
        </label>
        <label>
          Estado *
          <select value={form.estado} onChange={set('estado')}>
            <option value="pendiente">Pendiente</option>
            <option value="completada">Completada</option>
          </select>
        </label>
        <div className="form-actions full">
          <Link className="btn" to="/tareas">
            Cancelar
          </Link>
          <button className="btn btn-primary">Guardar tarea</button>
        </div>
      </form>
    </section>
  );
}
