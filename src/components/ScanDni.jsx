import React, { useState } from 'react';
import BarcodeScannerComponent from "react-qr-barcode-scanner"; // Usamos BarcodeScannerComponent
import { useEffect } from 'react';

const ScanDni = () => {
  const [data, setData] = useState(null); // Estado para almacenar los datos escaneados
  const [scanning, setScanning] = useState(false); // Estado para mostrar si está escaneando

  const handleScan = (result) => {
    if (result) {
      setData(result.text); // Actualiza el estado con los datos escaneados
      setScanning(false); // Detener el escaneo después de obtener un resultado
    }
  };

  const handleError = (error) => {
    console.error(error);
  };

  // Hacer que la cámara empiece a escanear
  useEffect(() => {
    setScanning(true);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl mb-4">Escanear Código QR o de Barra</h1>

      {/* Agregar un borde indicativo de dónde colocar el código */}
      <div className="relative">
        <div
          className="absolute top-0 left-0 w-full h-full border-4 border-dashed border-blue-500 opacity-50"
          style={{ zIndex: 1 }}
        ></div>
        <BarcodeScannerComponent
          width="100%"
          height="auto"
          onScan={handleScan}
          onError={handleError}
        />
      </div>

      {/* Indicador visual de la lectura exitosa */}
      {data && (
        <div className="mt-4">
          <h2 className="text-xl mb-2">¡Lectura Exitosa!</h2>
          <p>{data}</p> {/* Muestra los datos escaneados en formato de texto */}
        </div>
      )}

      {/* Estado de escaneo */}
      {scanning && !data && (
        <div className="mt-4 text-sm text-gray-500">Por favor, escanea el código.</div>
      )}
    </div>
  );
};

export default ScanDni;
