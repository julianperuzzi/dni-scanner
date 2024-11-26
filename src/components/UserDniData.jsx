// src/components/UserDniData.jsx
import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { supabase } from '../supabaseClient';

const UserDniData = () => {
  const { user } = useUser();
  const [dniData, setDniData] = useState([]);
  const [notification, setNotification] = useState('');

  useEffect(() => {
    if (user) {
      // Obtener los datos del usuario autenticado
      const fetchData = async () => {
        const { data, error } = await supabase
          .from('dni_data')
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error al obtener los datos', error);
        } else {
          setDniData(data);
        }
      };

      fetchData();
    }
  }, [user]);

  // Función para copiar los datos al portapapeles
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setNotification('¡Datos copiados al portapapeles!');
      setTimeout(() => {
        setNotification('');
      }, 1000); // La notificación desaparece después de 1 segundo
    });
  };

  // Función para copiar todos los datos de una fila
  const copyAllFields = (item) => {
    const allFields = `${item.first_name} ${item.last_name}\n${item.gender}\n${item.dni_number}\n${new Date(item.birth_date).toLocaleDateString()}`;
    navigator.clipboard.writeText(allFields).then(() => {
      setNotification('¡Todos los datos copiados al portapapeles!');
      setTimeout(() => {
        setNotification('');
      }, 1000); // La notificación desaparece después de 1 segundo
    });
  };

  // Función para eliminar los datos
  const deleteData = async (id) => {
    const { error } = await supabase
      .from('dni_data')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error al eliminar el dato', error);
    } else {
      setDniData(dniData.filter((item) => item.id !== id));
      setNotification('¡Dato eliminado correctamente!');
      setTimeout(() => {
        setNotification('');
      }, 1000); // La notificación desaparece después de 1 segundo
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-800">
      <h1 className="text-3xl font-bold mb-6 text-white">Mis Datos Escaneados</h1>

      {/* Notificación */}
      {notification && (
        <div className="fixed top-0 left-1/2 transform -translate-x-1/2 bg-green-500 text-white p-3 rounded-md shadow-md transition-opacity duration-500">
          {notification}
        </div>
      )}

      {/* Tabla de Datos */}
      {dniData.length === 0 ? (
        <p className="text-white">No has escaneado ningún DNI aún.</p>
      ) : (
        <div className="overflow-x-auto w-full">
          <table className="min-w-full bg-gray-700 border border-gray-600 shadow-md rounded-lg">
            <thead>
              <tr>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-white">Nombre Completo</th>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-white">Género</th>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-white">Número DNI</th>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-white">Fecha de Nacimiento</th>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-white">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {dniData.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-600">
                  <td className="py-3 px-4 text-sm text-white cursor-pointer" onClick={() => copyToClipboard(`${item.first_name} ${item.last_name}`)}>
                    {item.first_name} {item.last_name}
                  </td>
                  <td className="py-3 px-4 text-sm text-white cursor-pointer" onClick={() => copyToClipboard(item.gender)}>
                    {item.gender}
                  </td>
                  <td className="py-3 px-4 text-sm text-white cursor-pointer" onClick={() => copyToClipboard(item.dni_number)}>
                    {item.dni_number}
                  </td>
                  <td className="py-3 px-4 text-sm text-white cursor-pointer" onClick={() => copyToClipboard(new Date(item.birth_date).toLocaleDateString())}>
                    {new Date(item.birth_date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-sm flex space-x-4">
                    <button
                      onClick={() => copyAllFields(item)}
                      className="text-blue-500 hover:text-blue-700 focus:outline-none"
                    >
                      Copiar Todo
                    </button>
                    <button
                      onClick={() => deleteData(item.id)}
                      className="text-red-500 hover:text-red-700 focus:outline-none"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserDniData;
