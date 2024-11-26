import React, { useState, useEffect } from "react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";

function DniScanner() {
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [scannedData, setScannedData] = useState("");

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const videoInputs = devices.filter((device) => device.kind === "videoinput");

      // Buscar la cámara trasera o usar la primera disponible
      const backCamera =
        videoInputs.find((device) =>
          device.label.toLowerCase().includes("back") || device.label.toLowerCase().includes("rear")
        ) || videoInputs[1]; // Usar la primera como fallback

      if (backCamera) {
        setSelectedDeviceId(backCamera.deviceId);
      }
    }).catch((error) => {
      console.error("Error al enumerar dispositivos:", error);
    });
  }, []);

  const handleScan = (err, result) => {
    if (result) {
      setScannedData(result.text);
    } else if (err) {
      console.error("Error al escanear:", err);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>Escanear DNI</h2>
      {selectedDeviceId ? (
        <BarcodeScannerComponent
          width={500}
          height={500}
          onUpdate={handleScan}
          videoConstraints={{
            deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          }}
        />
      ) : (
        <p>Cargando cámaras...</p>
      )}
      <h2>Resultado del escaneo:</h2>
      <p>{scannedData || "Aún no se ha escaneado ningún código."}</p>
    </div>
  );
}

export default DniScanner;
