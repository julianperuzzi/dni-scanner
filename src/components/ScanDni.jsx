// src/components/ScanDni.jsx
import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import BarcodeScanner from 'react-qr-barcode-scanner'; // Verifica la importación correcta
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const ScanDni = () => {
  const [data, setData] = useState(null);
  const { user } = useUser();
  const navigate = useNavigate();

  const handleScan = async (result) => {
    if (result) {
      setData(result.text);

      // Aquí deberías procesar los datos y guardarlos en la base de datos
      const { document_number, last_name, first_name, gender, dni_number, birth_date } = parseDni(result.text);

      const { error } = await supabase.from('dni_data').insert([
        {
          user_id: user.id,
          document_number,
          last_name,
          first_name,
          gender,
          dni_number,
          birth_date,
        },
      ]);

      if (error) {
        console.error('Error al guardar los datos', error);
      } else {
        alert('Datos guardados correctamente');
      }
    }
  };

  const handleError = (error) => {
    console.error(error);
  };

  if (!user) {
    return <div>No estás autenticado. Redirigiendo...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl mb-4">Escanear DNI</h1>
      <BarcodeScanner onScan={handleScan} onError={handleError} />
      {data && <p>Datos Escaneados: {data}</p>}
    </div>
  );
};

export default ScanDni;
