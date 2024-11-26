import React, { useState, useEffect } from "react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";

function DniScanner() {
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [scannedData, setScannedData] = useState("");

  // Obtener las cámaras disponibles y configurar automáticamente la cámara trasera
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const videoInputs = devices.filter((device) => device.kind === "videoinput");

      // Buscar cámara trasera por label o usar la última cámara
      const backCamera =
        videoInputs.find((device) =>
          device.label.toLowerCase().includes("back") || device.label.toLowerCase().includes("rear")
        ) || videoInputs[videoInputs.length - 1]; // Usar última cámara como fallback

      if (backCamera) {
        setSelectedDeviceId(backCamera.deviceId);
      } else if (videoInputs.length > 0) {
        setSelectedDeviceId(videoInputs[0].deviceId); // Usar la primera si no hay más opciones
      }
    });
  }, []);

  const handleScan = (err, result) => {
    if (result) {
      setScannedData(result.text);
    } else if (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>Escanear DNI</h2>
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
      <h2>Resultado del escaneo:</h2>
      <p>{scannedData || "Aún no se ha escaneado ningún código."}</p>
    </div>
  );
}

export default DniScanner;
