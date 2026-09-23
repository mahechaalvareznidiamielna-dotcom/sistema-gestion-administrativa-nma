import { useState } from 'react';
import { useAuth } from '../auth.jsx';
import { api } from '../api.js';

export default function Configuracion() {
  const { usuario, actualizarSesion } = useAuth();
  const [form, setForm] = useState({
    nombre: usuario.nombre,
    email: usuario.email,
    password: '',
  });
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const guardar = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');
    try {
      const body = { nombre: form.nombre, email: form.email };
      if (form.password) body.password = form.password;
      const data = await api('/auth/perfil', { method: 'PATCH', body });
      actualizarSesion(data);
      setForm({ ...form, password: '' });
      setMensaje('Datos actualizados.');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="card form-card">
      <h2>Configuración</h2>
      <p>Actualiza los datos de quien administra la papelería.</p>
      {mensaje && <div className="ok">{mensaje}</div>}
      {error && <div className="alerta">{error}</div>}
      <form className="form-grid" onSubmit={guardar}>
        <label>
          Nombre
          <input
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            required
          />
        </label>
        <label>
          Correo
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </label>
        <label className="full">
          Nueva contraseña (opcional)
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            minLength={6}
          />
        </label>
        <div className="form-actions full">
          <button className="btn btn-primary">Guardar cambios</button>
        </div>
      </form>
    </section>
  );
}
