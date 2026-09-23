import { createContext, useContext, useEffect, useState } from 'react';
import { api, getToken, setToken } from './api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      if (!getToken()) {
        setCargando(false);
        return;
      }
      try {
        const me = await api('/auth/me');
        setUsuario(me);
      } catch {
        setToken(null);
        setUsuario(null);
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  const login = async (email, password) => {
    const data = await api('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    setToken(data.accessToken);
    setUsuario(data.usuario);
  };

  const logout = () => {
    setToken(null);
    setUsuario(null);
  };

  const actualizarSesion = (data) => {
    if (data.accessToken) setToken(data.accessToken);
    setUsuario(data.usuario);
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
