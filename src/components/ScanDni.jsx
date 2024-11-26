import React, { useState } from 'react';
import BarcodeScanner from 'react-qr-barcode-scanner'; // Verifica la importación correcta

const ScanDni = () => {
  const [data, setData] = useState(null); // Estado para almacenar los datos escaneados

  const handleScan = (result) => {
    if (result) {
      setData(result.text); // Actualiza el estado con los datos escaneados
    }
  };

  const handleError = (error) => {
    console.error(error);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl mb-4">Escanear Código QR o de Barra</h1>
      <BarcodeScanner onScan={handleScan} onError={handleError} />
      
      {data && (
        <div className="mt-4">
          <h2 className="text-xl mb-2">Datos Escaneados:</h2>
          <pre>{data}</pre> {/* Muestra los datos escaneados en formato de texto */}
        </div>
      )}
    </div>
  );
};

export default ScanDni;
