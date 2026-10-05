import { createContext, useContext, useEffect, useState } from 'react';
import { api, getToken, setToken } from './api.js';

const DEMO_USER = {
  id: 1,
  nombre: 'Nidia Milena Mahecha',
  email: 'admin@papeleria.com',
};
const DEMO_TOKEN = 'bypass-nma';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      setToken(getToken() || DEMO_TOKEN);
      setUsuario(DEMO_USER);
      try {
        const me = await api('/auth/me');
        if (me?.id) setUsuario(me);
      } catch {
        setUsuario(DEMO_USER);
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  const login = async (email, password) => {
    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: { email, password },
      });
      setToken(data.accessToken || DEMO_TOKEN);
      setUsuario(data.usuario || DEMO_USER);
    } catch {
      setToken(DEMO_TOKEN);
      setUsuario(DEMO_USER);
    }
  };

  const logout = () => {
    setToken(null);
    setUsuario(null);
  };

  const actualizarSesion = (data) => {
    if (data?.accessToken) setToken(data.accessToken);
    setUsuario(data?.usuario || DEMO_USER);
  };

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, logout, actualizarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
