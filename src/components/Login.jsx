// src/components/Login.jsx
import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const { login } = useUser();
  const navigate = useNavigate();
  const inputRef = React.createRef(); // Referencia al input

  // Poner el foco automáticamente en el campo de usuario cuando se carga la página
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    // Buscar el usuario en la base de datos
    const { data, error } = await supabase
      .from('users')
      .select('id, username')
      .eq('username', username)
      .single();

    if (error || !data) {
      setError('Usuario no encontrado');
    } else {
      // Iniciar sesión y guardar el usuario en el contexto
      login(data.username, data.id);
      navigate('/');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4 text-white">
      <h1 className="text-3xl font-semibold mb-6">Iniciar sesión</h1>
      <form onSubmit={handleLogin} className="flex flex-col items-center w-full max-w-md bg-gray-800 p-6 rounded-lg shadow-lg">
        <input
          ref={inputRef} // Aplicar la referencia al input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Nombre de usuario"
          className="mb-4 p-3 w-full text-gray-900 bg-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
        />
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md shadow-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Iniciar sesión
        </button>
      </form>
    </div>
  );
};

export default Login;
