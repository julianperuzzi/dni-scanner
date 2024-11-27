import React, { createContext, useState, useEffect, useContext } from 'react';

// Contexto de Usuario
const UserContext = createContext();

// Componente para proveer el contexto
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Usamos useEffect para leer del localStorage al cargar la aplicación
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    console.log('Recuperando del localStorage:', storedUser); // Agregado para depuración
    if (storedUser) {
      setUser(JSON.parse(storedUser)); // Si existe, se carga del localStorage
    }
  }, []);

  // Función para iniciar sesión
  const login = (username, userId) => {
    const newUser = { username, id: userId };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser)); // Guardamos el usuario en localStorage
  };

  // Función para cerrar sesión
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user'); // Limpiamos el localStorage
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useUser = () => useContext(UserContext);
