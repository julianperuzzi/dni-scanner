import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import BarcodeScanner from 'react-qr-barcode-scanner'; // Verifica la importación correcta
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

// Función para interpretar los datos escaneados
const parseDni = (dniString) => {
  const parts = dniString.split('@');
  
  if (parts.length !== 9) {
    throw new Error('Formato de DNI no válido');
  }
  
  // Asignar cada parte a una variable
  return {
    document_number: parts[0], // Número de documento
    last_name: parts[1],       // Apellido
    first_name: parts[2],      // Nombre completo
    gender: parts[3],          // Género
    dni_number: parts[4],      // Número de DNI
    document_type: parts[5],   // Tipo de documento
    birth_date: parts[6],      // Fecha de nacimiento
    issue_date: parts[7],      // Fecha de emisión
    final_code: parts[8],      // Código final
  };
};

const ScanDni = () => {
  const [data, setData] = useState(null);
  const { user } = useUser();
  const navigate = useNavigate();

  const handleScan = async (result) => {
    if (result) {
      setData(result.text);

      // Procesar los datos del DNI
      try {
        const {
          document_number,
          last_name,
          first_name,
          gender,
          dni_number,
          document_type,
          birth_date,
          issue_date,
          final_code
        } = parseDni(result.text);

        // Guardar los datos en Supabase
        const { error } = await supabase.from('dni_data').insert([
          {
            user_id: user.id,
            document_number,
            last_name,
            first_name,
            gender,
            dni_number,
            document_type,
            birth_date,
            issue_date,
            final_code,
          },
        ]);

        if (error) {
          console.error('Error al guardar los datos', error);
        } else {
          alert('Datos guardados correctamente');
          // Redirigir o realizar alguna acción adicional
          navigate('/my-data');  // Ejemplo de redirección
        }
      } catch (error) {
        console.error('Error al procesar los datos del DNI', error);
        alert('Error al procesar los datos');
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
