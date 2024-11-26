import React from "react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";

function ScanDni() {
  const [data, setData] = React.useState("Not Found");
  const [isScanning, setIsScanning] = React.useState(true); // Control del estado de escaneo

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Escanear Código QR o de Barra</h1>
      
      {/* Contenedor para el escáner con un borde indicativo */}
      <div className="relative">
        <div
          className="absolute top-0 left-0 w-full h-full border-4 border-dashed border-blue-500"
          style={{ zIndex: 1 }}
        ></div>
        
        {isScanning && (
          <BarcodeScannerComponent
            width={500}
            height={500}
            onUpdate={(err, result) => {
              if (result) {
                setData(result.text);
                setIsScanning(false); // Detener escaneo al obtener datos
              } else {
                setData("Not Found");
              }
            }}
          />
        )}
      </div>

      {/* Mensaje al finalizar lectura */}
      {data !== "Not Found" && (
        <div className="mt-4 bg-green-100 border border-green-400 text-green-700 p-4 rounded">
          <h2 className="text-xl font-bold mb-2">¡Lectura Exitosa!</h2>
          <p>{data}</p>
        </div>
      )}

      {/* Botón para reactivar el escáner */}
      {!isScanning && (
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => setIsScanning(true)}
        >
          Escanear Otro Código
        </button>
      )}
    </div>
  );
}

export default ScanDni;
