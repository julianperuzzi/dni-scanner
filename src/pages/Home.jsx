// src/components/Home.jsx
import React from 'react';
import { useUser } from '../context/UserContext';
import { Link } from 'react-router-dom';

const Home = () => {
  const { user, logout } = useUser();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
      <h1 className="text-4xl font-semibold text-center text-gray-300 mb-6 uppercase w-full p-4">
        DNI Scanner
      </h1>

      {/* Mostrar información del usuario si está autenticado */}
      {user ? (
        <div className="bg-gray-800 text-gray-100 p-6 rounded-xl shadow-lg mb-8 w-full max-w-md text-center">
          <h2 className="text-2xl font-semibold">¡Hola, {user.username}!</h2>
          <p className="mb-4 text-green-300"> ● Estás conectado a tu cuenta.</p>
          <button
            onClick={logout}
            className="bg-red-600 px-6 py-2 rounded-full text-white hover:bg-red-500 transition duration-300"
          >
            Cerrar sesión
          </button>
        </div>
      ) : (
        <div className="bg-gray-800 text-gray-100 p-6 rounded-xl shadow-lg mb-8 w-full max-w-md text-center">
          <h2 className="text-xl font-semibold">◈ No estás autenticado ◈</h2>
          <Link
            to="/login"
            className="bg-blue-600 text-white px-6 py-2 rounded-full mt-4 inline-block hover:bg-blue-500 transition duration-300"
          >
            Iniciar sesión
          </Link>
        </div>
      )}

      {/* Menú de opciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-800 p-8 rounded-xl shadow-lg text-center transition duration-300 hover:shadow-2xl">
          <h3 className="text-xl font-semibold text-gray-100 mb-4">Escanear DNI</h3>
          <p className="mb-4 text-gray-400">Escanea un código de barras o QR de un DNI para procesar la información.</p>
          {user ? (
            <Link
              to="/scan"
              className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-500 transition duration-300"
            >
              Comenzar a escanear
            </Link>
          ) : (
            <p className="text-gray-500">Necesitas iniciar sesión para escanear.</p>
          )}
        </div>

        <div className="bg-gray-800 p-8 rounded-xl shadow-lg text-center transition duration-300 hover:shadow-2xl">
          <h3 className="text-xl font-semibold text-gray-100 mb-4">Mis Datos Escaneados</h3>
          <p className="mb-4 text-gray-400">Acceso a todos los Datos Escaneados, exclusivo perfil Adminitrador</p>
          {user ? (
            <Link
              to="/my-data"
              className="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-500 transition duration-300"
            >
              Ver mis datos
            </Link>
          ) : (
            <p className="text-gray-500">Necesitas iniciar sesión para ver tus datos.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
