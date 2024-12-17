import React, { useState } from "react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";

function BarcodeScanner({ selectedDeviceId, handleScan }) {
  const [error, setError] = useState("");

  return (
    <div>
      {error ? (
        <div className="text-red-600">
          <p>Error al acceder a la cámara: {error}</p>
        </div>
      ) : (
        <BarcodeScannerComponent
          width={500}
          height={300}
          delay={100}
          onUpdate={handleScan}
          onError={(err) => setError(err.message || "Acceso denegado a la cámara.")}
          videoConstraints={{
            deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          }}
        />
      )}
    </div>
  );
}

export default BarcodeScanner;
