import React, { useState, useEffect } from "react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";

function DniScanner() {
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [videoDevices, setVideoDevices] = useState([]);
  const [scannedData, setScannedData] = useState("");

  // Obtener las cámaras disponibles
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const videoInputs = devices.filter((device) => device.kind === "videoinput");
      setVideoDevices(videoInputs);
      if (videoInputs.length > 0) {
        setSelectedDeviceId(videoInputs[0].deviceId); // Seleccionar la primera cámara por defecto
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
      {videoDevices.length > 1 && (
        <div>
          <label htmlFor="camera-select">Seleccionar Cámara:</label>
          <select
            id="camera-select"
            onChange={(e) => setSelectedDeviceId(e.target.value)}
            value={selectedDeviceId}
          >
            {videoDevices.map((device, index) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Cámara ${index + 1}`}
              </option>
            ))}
          </select>
        </div>
      )}
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
