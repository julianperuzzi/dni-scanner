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
  const [processedData, setProcessedData] = useState(null); // Estado para los datos procesados
  const { user } = useUser();
  const navigate = useNavigate();

  const handleScan = async (result) => {
    if (result) {
      setData(result.text); // Mostrar la cadena escaneada en la interfaz

      // Procesar los datos del DNI
      try {
        const parsedData = parseDni(result.text);
        setProcessedData(parsedData); // Guardar los datos procesados en el estado

      } catch (error) {
        console.error('Error al procesar los datos del DNI', error);
        alert('Error al procesar los datos');
      }
    }
  };

  const handleSubmit = async () => {
    if (!processedData) {
      return;
    }

    // Guardar los datos en Supabase
    try {
      const { error } = await supabase.from('dni_data').insert([
        {
          user_id: user.id,
          document_number: processedData.document_number,
          last_name: processedData.last_name,
          first_name: processedData.first_name,
          gender: processedData.gender,
          dni_number: processedData.dni_number,
          birth_date: processedData.birth_date,
        },
      ]);

      if (error) {
        console.error('Error al guardar los datos', error);
      } else {
        alert('Datos guardados correctamente');
        navigate('/my-data'); // Redirigir después de guardar
      }
    } catch (error) {
      console.error('Error al procesar los datos del DNI', error);
      alert('Error al guardar los datos');
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
      
      {data && (
        <div className="mt-4">
          <h2 className="text-xl mb-2">Datos Escaneados:</h2>
          <pre>{data}</pre>
        </div>
      )}

      {processedData && (
        <div className="mt-4">
          <h2 className="text-xl mb-2">Datos Procesados:</h2>
          <ul>
            <li><strong>Documento:</strong> {processedData.document_number}</li>
            <li><strong>Apellido:</strong> {processedData.last_name}</li>
            <li><strong>Nombre:</strong> {processedData.first_name}</li>
            <li><strong>Género:</strong> {processedData.gender}</li>
            <li><strong>Número de DNI:</strong> {processedData.dni_number}</li>
            <li><strong>Tipo de Documento:</strong> {processedData.document_type}</li>
            <li><strong>Fecha de Nacimiento:</strong> {processedData.birth_date}</li>
            <li><strong>Fecha de Emisión:</strong> {processedData.issue_date}</li>
            <li><strong>Código Final:</strong> {processedData.final_code}</li>
          </ul>

          <button
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
            onClick={handleSubmit}
          >
            Confirmar y Guardar
          </button>
        </div>
      )}
    </div>
  );
};

export default ScanDni;
